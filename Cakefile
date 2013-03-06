# build script adapted from ShareJ

{exec} = require 'child_process'
fs = require 'fs'

task 'build', 'Build the .js files', (options) ->
	console.log('Compiling Coffee from coffee to source')
	exec "coffee --compile --output source/ coffee/", (err, stdout, stderr) ->
		throw err if err
		console.log stdout + stderr
	console.log('Compiling Coffee tests')
	exec "coffee --compile --bare --output SpecRunner/ spec/", (err, stdout, stderr) ->
		throw err if err
		console.log stdout + stderr
	exec "coffee --compile --bare --output SpecRunner/ SpecRunner/", (err, stdout, stderr) ->
		throw err if err
		console.log stdout + stderr
	
task 'docs', 'Build the doc files', (options) ->
	console.log('Building docs to /docs')
	exec "cp -rf ./coffee ./fields", (err, stdout, stderr) ->
		throw err if err
		# remove parts that throw errors, remove closures
		data = fs.readFileSync("./fields/Fields.coffee", 'utf8').split("\n").slice(0, -6).join("\n")
		fs.writeFileSync("./fields/Fields.coffee", data, "utf8")

		data = fs.readFileSync("./fields/ContainerFields.coffee", 'utf8').split("\n").slice(6, -6)
		data = data.map((x) -> x.slice(2))
		fs.writeFileSync("./fields/ContainerFields.coffee", data.join("\n"), "utf8")

		data = fs.readFileSync("./fields/localized/en/Fields.coffee", 'utf8').split("\n").slice(3, -6)
		data = data.map((x) -> x.slice(2))
		fs.writeFileSync("./fields/localized/en/Fields.coffee", data.join("\n"), "utf8")

		exec "./node_modules/coffeedoc-lm/bin/coffeedoc --output ./api/fields --requirejs ./fields", (err, stdout, stderr) ->
			throw err if err
			exec "rm -rf ./fields"

task 'watch', 'Watch coffee directory and build the .js files', (options) ->
	console.log('Watching Coffee in coffee and compiling to source')
	cp = exec "coffee --watch --output source/ coffee/"
	cp.stdout.on "data", (data) -> console.log(data)
	cp.stderr.on "data", (data) -> console.log(data)
	console.log('Watching Coffee in spec and compiling to SpecRunner')
	cp2 = exec "coffee --watch --bare --output SpecRunner/ spec/"
	cp2.stdout.on "data", (data) -> console.log(data)
	cp2.stderr.on "data", (data) -> console.log(data)
	cp3 = exec "coffee --watch --bare --output SpecRunner/ SpecRunner/"
	cp3.stdout.on "data", (data) -> console.log(data)
	cp3.stderr.on "data", (data) -> console.log(data)
	