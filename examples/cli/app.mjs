// Reads the secret that `envilder exec` put in the environment
console.log(`API_KEY=${process.env.API_KEY ? 'set' : 'missing'}`);
