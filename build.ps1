# Builds deployment-ready project

cd front_end
# build react project
npm run build
cd ..
# collect all static files into the 'static' directory
python manage.py collectstatic
# create directory for files that will be served at '/' e.g manifest, robots, etc...
New-Item -Path . -Name "root_files" -ItemType "directory" -Force > $null
# move all root files to root directory except the index and static files
Get-ChildItem -Path ./front_end/build -Exclude "index.html", "static" | Move-Item -Destination ./root_files

echo ""
echo "*Remember* to set QuickChat.settings DEBUG to False"
echo "run server with daphne -b 0.0.0.0 -p 80 QuickChat.asgi:application"
