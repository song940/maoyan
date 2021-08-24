const maoyan = require('..');

const { movie } = maoyan();

(async () => {

    const m = await movie(1);
    console.log(m);

})();