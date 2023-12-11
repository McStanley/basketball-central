const validate = async (chains, req) => {
  for (const chain of chains) {
    await chain.run(req);
  }
};

module.exports = validate;
