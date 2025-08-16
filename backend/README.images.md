Image fetching (Pixabay)

Use the script scripts/fetch_from_pixabay_api.js to download and cache images locally.

Recommended: put your key in backend/.env (do NOT commit your key):

PIXABAY_API_KEY=YOUR_KEY_HERE

Then run:

npm run fetch-images

This will download images into backend/public/images and update backend/public/images/map.json.

Alternatively, you can run with a CLI flag (avoids env var issues):

node scripts/fetch_from_pixabay_api.js --key YOUR_KEY_HERE

Avoid putting keys directly into commands that may be logged or shared.
