const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
let localStream;

//Get the id from the url
let peer;
let guide = window.location.href.split("?")[1];
let userId = guide.split("=")[1];

//Check if he is joining or creating the room
if (guide.includes("invite_link")) {
  let myId =
    Date.now().toString(36) + "-" + Math.round(Math.random() * 10000000);
  init(myId);
  callSomeone(userId);
} else {
  init(userId);
  console.log('start animation')
  document.getElementById('snackbar').classList.toggle('show')
  setTimeout(()=> document.getElementById('snackbar').classList.toggle('show'),3000)
}

//=========================
//Peer stream exchanging
//====================

function init(userId) {
  peer = new Peer(userId, {
    host: "0.peerjs.com",
    secure: true,
    port: 443,
    path: "/",
  });
  peer.on("open", () => console.log("peer opened"));
  listen();
}

function listen() {
  peer.on("call", async (call) => {
    let selfStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        channelCount: 2,
        noiseCancellation: true,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: true,
        sampleRate: 48000,
        sampleSize: 16,
        volume: 1.0,
      },
      video: true,
    });

    localVideo.srcObject = selfStream;
    localStream = selfStream;

    call.answer(selfStream);
    call.on("stream", (remoteStream) => {
      remoteVideo.srcObject = remoteStream;
      remoteVideo.style.display = "block";
      localVideo.classList.add("smallFrame");
    });
  });
}

async function callSomeone(otherUserId) {
  let stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: false,
      channelCount: 2,
      echoCancellation: false,
      noiseCancellation: true,
      latency: 0,
      noiseSuppression: true,
      sampleRate: 48000,
      sampleSize: 16,
      volume: 1.0,
    },
    video: true,
  });

  localVideo.srcObject = stream;
  localStream = stream;

  const call = await peer.call(otherUserId, stream);
  call.on("stream", (remoteStream) => {
    remoteVideo.srcObject = remoteStream;
    remoteVideo.style.display = "block";
    localVideo.classList.add("smallFrame");
  });
}

//==================================
// CONTROLS
//==========

let handleUserLeft = (MemberId) => {
  remoteVideo.style.display = "none";
  localVideo.classList.remove("smallFrame");
};

let toggleCamera = async () => {
  let videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video");

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    document.getElementById("camera-btn").style.backgroundColor =
      "rgb(255, 80, 80)";
  } else {
    videoTrack.enabled = true;
    document.getElementById("camera-btn").style.backgroundColor = "#1a2332";
  }
};

let toggleMic = async () => {
  let audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    document.getElementById("mic-btn").style.backgroundColor =
      "rgb(255, 80, 80)";
  } else {
    audioTrack.enabled = true;
    document.getElementById("mic-btn").style.backgroundColor = "#1a2332";
  }
};

// window.addEventListener('beforeunload', leaveChannel)

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
