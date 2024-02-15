const client = new HuddleWebCore.HuddleClient({
  projectId: 'TxG-OolMwGeCoZPzX660e65wwuU2MP83',
  options: {
    activeSpeakers: {
      // Number of active speaker visible in the grid, by default 8
      size: 10,
    },
  },
});

const init = async () => {
  const roomId = document.getElementById('roomId').value;
  const accessToken = document.getElementById('accessToken').value;

  console.log({ roomId, accessToken });
  const room = await client.joinRoom({
    roomId: roomId,
    token: accessToken,
  });
  console.log({ room });
};

const enableVideo = async () => {
  await client.localPeer.enableVideo();
  const stream = await client.localPeer.getStream({
    label: 'video',
  });
  const video = document.getElementById('localVideo');
  video.srcObject = stream;
};

const enableAudio = async () => {
  await client.localPeer.enableAudio();
};

client.room.on('stream-added', ({ peerId, label }) => {
  console.log('stream-added', peerId, label);
});
