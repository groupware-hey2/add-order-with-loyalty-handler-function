const archiver = require('archiver');
const fs = require('fs');

const output = fs.createWriteStream(__dirname + '/../add-order-with-loyalty-handler.zip');
const archive = archiver('zip');

output.on('close', () => {
  console.log(`Archivo ZIP creado con éxito. Tamaño: ${archive.pointer()} bytes.`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(__dirname + '/../dist', false, { base: '/' });
archive.finalize();
