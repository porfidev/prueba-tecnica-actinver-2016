// Wait for every destination stream without bridging streamx through merge-stream.
module.exports = function () {
  return Promise.all(
    Array.prototype.map.call(arguments, function (stream) {
      return new Promise(function (resolve, reject) {
        stream.on('error', reject);
        stream.on('end', resolve);
        stream.resume();
      });
    })
  );
};
