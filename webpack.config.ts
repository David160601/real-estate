module.exports = {
  //

  //
  resolve: {
    // ...
    fallback: {
      // 👇️👇️👇️ add this 👇️👇️👇️
      assert: require.resolve("assert"),
    },
  },
};
