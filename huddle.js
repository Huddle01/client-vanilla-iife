const client = new HuddleWebCore.HuddleClient({
  projectId: 'TxG-OolMwGeCoZPzX660e65wwuU2MP83',
  options: {
    activeSpeakers: {
      // Number of active speaker visible in the grid, by default 8
      size: 10,
    },
  },
});

let token = '';
let roomId = '';
let displayName = '';

document.querySelector('#audio').addEventListener('click', async () => {
  const audioRef = document.querySelector('#audio');
  if (audioRef.textContent == 'Disable Audio') {
    await client.localPeer.disableAudio();
    audioRef.textContent = 'Enable Audio';
  } else {
    await client.localPeer.enableAudio();
    audioRef.textContent = 'Disable Audio';
  }
});

document.querySelector('#video').addEventListener('click', async () => {
  const videoRef = document.querySelector('#videoRef');

  if (videoRef.srcObject) {
    client.localPeer.disableVideo();
    document.querySelector('#video').textContent = 'Enable Video';
    return;
  }

  const stream = await client.localPeer.enableVideo();

  console.log('stream', stream);

  videoRef.srcObject = stream;
  videoRef.onloadedmetadata = async () => {
    console.warn('videoCard() | Metadata loaded...');
    try {
      await videoRef.play();
      document.querySelector('#video').textContent = 'Disable Video';
    } catch (error) {
      console.error(error);
    }
  };

  videoRef.onerror = () => {
    console.error('videoCard() | Error is hapenning...');
  };
});

document.querySelector('#screen').addEventListener('click', async () => {
  const screenRef = document.querySelector('#screenRef');

  if (screenRef.srcObject) {
    client.localPeer.stopScreenShare();
    screenRef.srcObject = null;
    document.querySelector('#screen').textContent = 'Share Screen';
    return;
  }

  const stream = await client.localPeer.startScreenShare();

  console.log('stream', stream);

  screenRef.srcObject = stream;
  screenRef.onloadedmetadata = async () => {
    console.warn('videoCard() | Metadata loaded...');
    try {
      await screenRef.play();
      document.querySelector('#screen').textContent = 'Stop Sharing';
    } catch (error) {
      console.error(error);
    }
  };

  screenRef.onerror = () => {
    console.error('videoCard() | Error is hapenning...');
  };
});

document.querySelector('#roomId').addEventListener('change', (e) => {
  roomId = e.target.value;
});

document.querySelector('#accessToken').addEventListener('change', (e) => {
  token = e.target.value;
});

document.querySelector('#displayName').addEventListener('change', (e) => {
  displayName = e.target.value;
});

document.querySelector('#joinRoom').addEventListener('click', async () => {
  const room = await client.joinRoom({
    roomId,
    token,
  });
  room.updateMetadata({
    displayName: displayName,
  });
  document.querySelectorAll('input').forEach((input) => {
    input.hidden = true;
  });
  document.querySelector('#joinRoom').hidden = true;
});

client.room.on('stream-added', ({ peerId, label }) => {
  console.log(
    'remote',
    client.room.getRemotePeerById(peerId)?.getConsumer(label)?.track,
    label
  );
  const container = document.querySelector('#remotePeers');
  let mediaRef = document.createElement('video');
  if (label == 'audio') {
    mediaRef = document.createElement('audio');
  }
  const remoteTrack = client.room
    .getRemotePeerById(peerId)
    ?.getConsumer(label)?.track;

  mediaRef.srcObject = new MediaStream([remoteTrack]);
  mediaRef.id = `${peerId}-${label}`;
  mediaRef.autoplay = true;
  if (label == 'video') {
    mediaRef.muted = true;
  }
  mediaRef.className = 'border-2 rounded-xl border-white-400 aspect-video';
  container.appendChild(mediaRef);
});

client.room.on('stream-closed', ({ peerId, label }) => {
  console.log('stream-closed', peerId, label);
  const mediaRef = document.querySelector(`#${peerId}-${label}`);
  mediaRef.srcObject.getTracks().forEach((track) => track.stop());
  mediaRef.srcObject = null;
  mediaRef.remove();
});
