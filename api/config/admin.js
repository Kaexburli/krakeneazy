module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '6fd825dddde19a78b0b83a9e529aab10'),
  },
});
