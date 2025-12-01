module.exports = {
  apps: [{
    name: 'bjh-bangkok',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -H 0.0.0.0 -p 3000',
    cwd: 'c:/Users/Administrator/Documents/GitHub/React-Business',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
