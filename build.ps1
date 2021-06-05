# Builds deployment-ready project

cd front_end
npm run build
cd ..
python manage.py collectstatic
New-Item -Path . -Name "root_files" -ItemType "directory" -Force
Get-ChildItem -Path ./front_end/build -Exclude "index.html", "static" | Move-Item -Destination ./root_files

echo "run server with daphne -b 0.0.0.0 -p 80 QuickChat.asgi:application"
