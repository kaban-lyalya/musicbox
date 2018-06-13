module.exports = {
  db: "mongodb://localhost/musicbox",
  defaultAvatar: "./static/noavatar.png",
  port: 5000,
  secretKey: "best secret key",

  // Limit uploading images (Bites)
  sizeLimitImg: 1000000,
  sizeLimitAudio: 60000000,

  // Scaling size of image (Pixels)
  width: 100,
  height: 100,

  // Allowed extensions and mimetype
  fileTypesImg: /jpeg|jpg|png|gif/,
  fileTypesAudio: /flac|mp3|ogg|wav/,

  // Path for write files
  filePath: "./data/avatars/"
};
