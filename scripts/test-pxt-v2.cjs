// The full library test suite exceeds V1 flash. Compile it for the supported V2.
// PXT 12's `test` command has no variant flag; use its target-variant API.
require('pxt-core/built/pxt.js');
const selectVariant = pxt.setAppTargetVariant;
const selectTarget = pxt.setAppTarget;
pxt.setAppTarget = target => {
    selectTarget(target);
    selectVariant('mbcodal');
};
pxt.setAppTargetVariant = (variant, options) => selectVariant(variant || 'mbcodal', options);
console.log('Full native test suite: micro:bit V2 (mbcodal), real V2 flash limits.');
process.argv = [process.execPath, require.resolve('pxt/cli.js'), 'test'];
require('pxt/cli.js');
