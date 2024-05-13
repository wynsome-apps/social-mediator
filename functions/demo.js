
const pkg = require('./package');
const server = require('./app');

const PORT = parseInt(process.env.PORT) || 8080;

// Start server
server.listen(PORT, () =>
  console.log(`${pkg.name}: listening on port ${PORT}`)
);

// Clean up resources on shutdown
process.on('SIGTERM', () => {
  console.log(`${pkg.name}: received SIGTERM`);
  // redisClient.quit();
  process.exit(0);
});

module.exports = server;