vim.keymap.set("n", "<Leader>D", ':exe "e" system("./scripts/daily.sh") <CR>')
vim.keymap.set("n", "<Leader>no", ':exe "e" system("./scripts/notes.sh") <CR>')
vim.keymap.set("n", "<Leader>bo", ':exe "e" system("./scripts/book.sh") <CR>')
vim.keymap.set("n", "<Leader>ra", ':exe "e" system("./scripts/random.sh") <CR>')
function mysplit(inputstr, sep)
	if sep == nil then
		sep = "%s"
	end
	local t = {}
	for str in string.gmatch(inputstr, "([^" .. sep .. "]+)") do
		table.insert(t, str)
	end
	return t
end

local function new_file(t)
	local output = vim.api.nvim_exec(string.format("!%s", "./scripts/" .. t.args), true)
	local splited = mysplit(output, "\n")
	vim.api.nvim_exec(string.format("edit %s", splited[2]), false)
end

vim.api.nvim_create_user_command("New", new_file, { nargs = 1 })
