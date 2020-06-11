'use strict';
let localStream = null;
let peer = null;
let existingCall = null;

navigator.mediaDevices.getUserMedia({video: true, audio: true})

    .then(function (stream) {
        // Success
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function (error) {
        // Error
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
});

peer = new Peer({
    key: '98f202a9-d1d2-4b68-b4c9-2aa7293ede56',
    debug: 3
});

//openイベント
peer.on('open', function(){
    $('#my-id').text(peer.id);
});

//error
peer.on('error', function(err){
    alert(err.message);
});

//close
peer.on('close', function(){
});

//disconnected
peer.on('disconnected', function(){
});

//発信処理
$('#make-call').submit(function(e){
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
});

//切断処理
$('#end-call').click(function(){
    existingCall.close();
});

//着信処理
peer.on('call', function(call){
    call.answer(localStream);
    setupCallEventHandlers(call);
});

//Callオブジェクトに必要なイベント
function setupCallEventHandlers(call){
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;
    //
    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
    });
    //
    call.on('close', function(){
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}

//UIのセットアップ

//video要素の再生
function addVideo(call,stream){
    $('#their-video').get(0).srcObject = stream;
}

//video要素の削除
function removeVideo(peerId){
    $('#their-video').get(0).srcObject = undefined;
}



//ボタンの表示、非表示切り替え
function setupMakeCallUI(){
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}



//カメラ,マイクのOnOFF機能を追加
//ミュート
const toggleCamera = document.getElementById('js-toggle-camera');
const toggleMicrophone = document.getElementById('js-toggle-microphone');
const cameraStatus = document.getElementById('camera-status');
const microphoneStatus = document.getElementById('microphone-status');

toggleCamera.addEventListener('click', () => {
  const videoTracks = localStream.getVideoTracks()[0];
  videoTracks.enabled = !videoTracks.enabled;
  cameraStatus.textContent = `カメラ${videoTracks.enabled ? 'ON' : 'OFF'}`;
});

toggleMicrophone.addEventListener('click', () => {
  const audioTracks = localStream.getAudioTracks()[0];
  audioTracks.enabled = !audioTracks.enabled;
  microphoneStatus.textContent = `マイク${audioTracks.enabled ? 'ON' : 'OFF'}`;
});


//videoタグの要素
const localVideo = document.getElementById('js-local-stream');

localVideo.srcObject = localStream;
localVideo.muted = true; // 自分の音声を自分のスピーカーから聞こえなくする。相手には届く。
localVideo.playsInline = true;
localVideo.autoplay = true;
