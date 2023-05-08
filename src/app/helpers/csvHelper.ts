import { ImageWithData } from './fileHelper';

function createCSVData(
  images: ImageWithData[],
  tags: string[],
  title: string,
  category?: number
): string {
  const csvSplitter = ',';
  const rows = images.map((image) => {
    return {
      Filename: image.name,
      Title: title,
      Keywords: `"${tags.join(csvSplitter)}"`,
      Category: category?.toString(),
      Releases: '',
    };
  });

  // Create CSV data
  const header = Object.keys(rows[0]).join(csvSplitter);
  const csvData =
    header +
    '\n' +
    rows.map((row) => Object.values(row).join(csvSplitter)).join('\n');

  return csvData;
}

function downloadCSV(
  images: ImageWithData[],
  tags: string[],
  title: string,
  category?: number
) {
  const csvData = createCSVData(images, tags, title, category);

  // Create a Blob from the CSV data
  const blob = new Blob([csvData], { type: 'text/csv' });
  // Create a downloadable link for the Blob
  const url = URL.createObjectURL(blob);
  // Create an anchor element and simulate a click to download the file
  const a = document.createElement('a');
  a.href = url;
  a.download = title + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { downloadCSV };
