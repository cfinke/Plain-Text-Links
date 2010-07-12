rm -rf .tmp_xpi_dir/

chmod -R 0777 plain-text-links/

mkdir .tmp_xpi_dir/
cp -r plain-text-links/* .tmp_xpi_dir/

rm -rf `find ./.tmp_xpi_dir/ -name ".DS_Store"`
rm -rf `find ./.tmp_xpi_dir/ -name "Thumbs.db"`
rm -rf `find ./.tmp_xpi_dir/ -name ".svn"`

cd .tmp_xpi_dir/chrome/
zip -rq ../plain-text-links.jar *
rm -rf *
mv ../plain-text-links.jar ./
cd ../
zip -rq ~/Desktop/plain-text-links.xpi *
cd ../
rm -rf .tmp_xpi_dir/
