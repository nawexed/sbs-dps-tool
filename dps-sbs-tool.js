const DeepSourceService = require('./src/deepsource');


async function main() {
    console.log('Creating report...');
    await DeepSourceService.CreateReport();

    console.log('Done!');
}

main();