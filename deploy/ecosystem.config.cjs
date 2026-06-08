module.exports = {
  apps: [
    {
      name: "anysoul-api",
      script: "dist-server/index.mjs",
      interpreter: "node",
      cwd: "/var/www/anysoul",
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      time: true,
      error_file: "/var/log/anysoul/api-error.log",
      out_file: "/var/log/anysoul/api-out.log"
    }
  ]
};
