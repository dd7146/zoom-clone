const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log("Got user media stream");
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    console.log("Receiving a call");
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      console.log("Received user's stream");
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', userId => {
    console.log('User connected:', userId);
    connectToNewUser(userId, stream);
  });
}).catch(error => {
  console.error("Error accessing media devices:", error);
});

socket.on('user-disconnected', userId => {
  console.log('User disconnected:', userId);
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
  console.log('My peer ID:', id);
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  console.log('Connecting to new user:', userId);
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    console.log('Adding video stream from new user');
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    console.log('Call closed');
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
  console.log("Added video stream");
}
