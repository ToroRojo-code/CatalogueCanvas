- LLM request failed: [Errno 111] Connection refused
- Create a setting page, for llm, export and backup data (db and config)
- Page for user setting. Input is by a button in the top bar that open a special page just for zip upload . these can be selected manually or drag-drop
- each page for a piece, the link to teh other files can be opened if those are images or text files, anything else are downloaded. Add option to download all as zip


////// Ignore and do not READ bellow this line ///////


make a plan (take no action) to port this repository from a static website creation to a webserver with a db that can ran from a docker container for installation. In a2 type of images one simple that is A single all-in-one   container that runs everything you need, including database and another called Standard, More control; requires a separate database server.. The  input can be done direcly importing teh zip file, configuration, users

- ability to create collections
- edit current collections
- share publicly art portfolios (like the ones from /Users/enrique/github/Porfolio)
- Edit information and  metadata of the work
- Use LLM api per user for description, bullet points



- The configuration must be automatic with a cli tool
  - This one ask for the name of the catalog, used on the website
  - custom input folder (intead of ingestion)
  - Prompt details for the llm desciption, how many bullet points. Or a single sentence, how long, which model, lm studio, ollama, anthropic api, gemini  api, etc...
  - custom output folder
  - backups path for ingested work
  - backup of metadata, db
  - This will create a master configuration file for the catalog name!
  - This way the CC pipeline and the saved digital work can be in different folders!
 
- How name of the collections are these made, edited created...

- The catalog must use a internal ID that is assigned to each work at ingestion. A random word ( sort -R /usr/share/dict/words | head -n 1)  dash 3 random digits. These are checked with the db that are not being used to avoid collisions

- prove that the best way to ingest data is a collection of zip files. Each zip file will be consider a work with a main image from svg, png, jpeg, tiff, etc that will be converted to webp, while the other files can be saved compressed (or not, this is an option) Thie can be code files, json, etc. This make the template more flexible to show the available files in thems of images, code (py, r, toml, json, p5...etc), text (txt md), other
