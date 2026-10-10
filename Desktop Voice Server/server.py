"""MEP local voice server. Bind localhost by default. Never expose unauthenticated publicly."""
import io, os, secrets, threading, wave, webbrowser, time
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory, render_template_string
from flask_cors import CORS
import qrcode
from piper import PiperVoice

ROOT=Path(__file__).resolve().parent
EDITOR=ROOT.parent
MODELS=ROOT/"models"; OUT=ROOT/"outputs"; MODELS.mkdir(exist_ok=True); OUT.mkdir(exist_ok=True)
HOST=os.getenv("MEP_HOST","127.0.0.1"); PORT=int(os.getenv("MEP_PORT","8765"))
TOKEN=os.getenv("MEP_TOKEN") or secrets.token_urlsafe(24)
app=Flask(__name__); CORS(app,resources={r"/api/*":{"origins":os.getenv("MEP_ORIGINS","http://localhost:8000,http://127.0.0.1:8000,https://novaeriahengine.github.io").split(",")}},allow_headers=["Content-Type","Authorization"])
cache={}; lock=threading.Lock()
HTML="""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>MEP Voice Studio</title><style>body{font:16px system-ui;background:#111827;color:#f5f6fc;max-width:840px;margin:30px auto;padding:20px}textarea,input,select,button{box-sizing:border-box;width:100%;margin:7px 0;padding:12px;border-radius:8px;border:1px solid #556;background:#202d44;color:white}button{cursor:pointer;background:#3859ac}label{display:block;margin-top:14px}audio{width:100%}pre{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#9ac8ff}</style></head><body><h1>MEP Offline Voice Studio</h1><p><a href="/editor/">Open the full MEP Video Maker editor locally</a> (core editing works offline; Firebase, AI APIs and historical maps require internet unless cached).</p><p>Private local Piper voice synthesis. Download a voice model once, then work without internet.</p><p><b>Server:</b> <span id="status">Checking…</span></p><label>Voice model<select id="model"></select></label><label>Text<textarea id="text" rows="7">Welcome to Noveria History. Today we explore the turning points that changed the world.</textarea></label><label>Speed (higher = faster)<input type="range" id="speed" min=".7" max="1.3" step=".05" value="1"></label><button id="generate">Generate WAV</button><p id="result"></p><audio controls id="player"></audio><a id="download" download="noveria-narration.wav" hidden>Download WAV</a><h2>Phone / QR</h2><p>QR connects to this server only if the phone can reach the laptop over the same Wi-Fi. To enable LAN mode, set MEP_HOST=0.0.0.0 before launch and protect your network. Do not port-forward.</p><img id="qr" width="190" height="190" alt="QR code"><p><a id="qrDownload" download="mep-server-qr.png">Download QR PNG</a></p><p id="address"></p><h2>Website connection</h2><p>The public HTTPS website cannot safely call a plain HTTP LAN address on every browser. For that use an authenticated HTTPS tunnel; otherwise download WAV here and import it into MEP Video Maker.</p><script>
const $=id=>document.getElementById(id);
fetch("/api/health").then(r=>r.json()).then(d=>{$("status").textContent=d.status;$("model").innerHTML=d.models.map(x=>'<option>'+x+'</option>').join("");$("address").textContent=location.href;$("qr").src="/qr?url="+encodeURIComponent(location.href);$("qrDownload").href=$("qr").src;if(!d.models.length)$("result").textContent="No model found. Run download_voice.bat first."}).catch(e=>$("status").textContent=e.message);
$("generate").onclick=async()=>{try{$("result").textContent="Generating…";const r=await fetch("/api/synthesize",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+window.MEP_LOCAL_TOKEN},body:JSON.stringify({text:$("text").value,model:$("model").value,speed:Number($("speed").value)})});if(!r.ok)throw Error((await r.json()).error||r.status);const blob=await r.blob();const url=URL.createObjectURL(blob);$("player").src=url;$("download").href=url;$("download").hidden=false;$("result").textContent="Ready."}catch(e){$("result").textContent=e.message}};
</script></body></html>"""
# Avoid embedding a secret in page source accessible on LAN; browser UI uses same-origin session route.
@app.get("/")
def home():
    from flask import make_response
    response=make_response(render_template_string(HTML.replace("window.MEP_LOCAL_TOKEN", "window.MEP_LOCAL_TOKEN")))
    response.set_cookie("mep_session",TOKEN,httponly=True,samesite="Strict")
    return response
@app.get("/editor/")
def editor():return send_from_directory(EDITOR,"index.html")
@app.get("/editor/<path:filename>")
def editor_asset(filename):
    if filename.startswith(("Desktop Voice Server/","Google Colab/")):return "Not found",404
    return send_from_directory(EDITOR,filename)
@app.get("/api/health")
def health():
    return jsonify(status="ready",models=[p.stem for p in MODELS.glob("*.onnx") if p.with_suffix(".onnx.json").exists()],engine="piper",offline=True)
@app.get("/qr")
def qr():
    url=request.args.get("url","")
    if not url.startswith(("http://127.0.0.1:","http://localhost:","http://192.168.","http://10.")):return "Invalid URL",400
    img=qrcode.make(url);b=io.BytesIO();img.save(b,format="PNG");b.seek(0);return send_file(b,mimetype="image/png")
@app.post("/api/synthesize")
def synth():
    auth=request.headers.get("Authorization","").removeprefix("Bearer ").strip()
    if not secrets.compare_digest(auth,TOKEN) and not secrets.compare_digest(request.cookies.get("mep_session",""),TOKEN):
        return jsonify(error="Invalid API token. Set token in website connection settings."),401
    body=request.get_json(silent=True) or {};txt=body.get("text","")
    if not isinstance(txt,str) or not txt.strip() or len(txt)>6000:return jsonify(error="Text must be 1–6000 characters"),400
    model=str(body.get("model","")).strip()
    if not model or "/" in model or "\\" in model or model.startswith("."):return jsonify(error="Invalid voice model"),400
    path=MODELS/(model+".onnx")
    if not path.is_file() or not path.with_suffix(".onnx.json").is_file():return jsonify(error="Download a voice model first"),400
    try:
        speed=float(body.get("speed",1));assert .65<=speed<=1.5
        from piper.config import SynthesisConfig
        with lock:
            if model not in cache:cache[model]=PiperVoice.load(str(path))
            audio=io.BytesIO()
            with wave.open(audio,"wb") as w:cache[model].synthesize_wav(txt,w,syn_config=SynthesisConfig(length_scale=1/speed))
        audio.seek(0)
        return send_file(audio,mimetype="audio/wav",as_attachment=True,download_name="noveria-narration.wav")
    except Exception as exc:
        app.logger.exception("Synthesis failed");return jsonify(error=str(exc)),500
if __name__=="__main__":
    print("\nMEP Voice Server:",f"http://{HOST}:{PORT}","\nAPI token (keep private):",TOKEN,"\n")
    threading.Timer(1.5,lambda:webbrowser.open(f"http://127.0.0.1:{PORT}")).start()
    app.run(host=HOST,port=PORT,debug=False,threaded=True)
