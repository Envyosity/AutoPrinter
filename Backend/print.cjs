/*
  To use the printer you need to install
  another driver called WinUSB to your usb
  using Zadig:
  https://sourceforge.net/projects/libwdi/files/zadig/zadig_v2.0.1.160.7z/download
  otherwise you will get this error:
  LIBUSB_ERROR_NOT_SUPPORTED
*/
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
require("dotenv").config();
/*
  https://www.nirsoft.net/utils/usbdeview.zip
  Install USBDeview to see the Vendor and Product ID
  of your printer and insert under here
*/
const device = new escpos.USB(/*VendorId here , ProducyId here*/);
const options = { encoding: "cp437" };
const printer = new escpos.Printer(device, options);

const formatDateTime = (date) => {
  const formattedDate = date
    .toLocaleString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+),/, "$1/$2/$3");
  return formattedDate;
};

function removeDiacritics(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
}


async function printTransfers(transferResult) {
  try {
    if (!Array.isArray(transferResult) || transferResult.length === 0) {
      console.log("No transfer data available.");
      return;
    }

    device.open(function (error) {
      if (error) {
        console.error("Error opening device:", error);
        return;
      }

      printer
        .align("ct")
        .size(0.03, 0.06)
        .style("bu")
        .text(`Transferência de Itens nº ${transferResult[0].id}\n`)
        .text(
          `Setor de origem: ${removeDiacritics(transferResult[0].originSector)}`
        )
        .text(
          `Setor de destino: ${removeDiacritics(
            transferResult[0].destinatedSector
          )}`
        )
        .text(`Data de realizaçao: ${formatDateTime(transferResult[0].datetime)}`)
        .text(`Operador: ${transferResult[0].operator}\n`);
      printer.text("Lista de Itens:").drawLine();

      console.log(transferResult);
      transferResult.forEach((transfer, index) => {
        printer.align("lt").text(`-Item: ${removeDiacritics(transfer.item)}`);

        if (transfer.mac || transfer.serial) {
          printer.text(
            `-MAC/Serial: ${
              transfer.mac
                ? transfer.mac
                : transfer.serialF
                ? transfer.serialF
                : transfer.serial
            }`
          );
        } else {
          printer.text(`-Quantidade: ${transfer.quantity}`);
        }

        printer.drawLine();
      });
      printer.text("\n").align("ct").drawLine().text("Assinatura \n \n");

      printer.cut().close();
    });
  } catch (error) {
    console.error("Error fetching transfers:", error);
  }
}

module.exports = { printTransfers };