const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const target=require(path.join(root,'node_modules/pxt-microbit/package.json'));
if(target.version!=='8.0.22')throw new Error('Expected pxt-microbit 8.0.22');
fs.writeFileSync(path.join(root,'node_modules/pxtcli.json'),JSON.stringify({targetdir:'pxt-microbit'},null,2));
console.log(`Node ${process.version}; microbit ${target.version}; PXT core ${require('pxt-core/package.json').version}; auxiliary TS ${require('typescript').version}`);
