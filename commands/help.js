export function showHelp() {
  console.log(`
      \x1b[1mUsage\x1b[0m 
      
        \x1b[1m$\x1b[0m tailwind-utopia <command> [options]
    
      \x1b[1mCommands\x1b[0m

            generate   Generates a custom CSS file.
              config   Create a configuration js file.
                help   Displays this help message.
    
      \x1b[1mOptions\x1b[0m

              --help   Displays this help message.
        
      \x1b[1m'generate' specific options:\x1b[0m

               dist=   Output file path. (Default: "./")
         configPath=   Path to a configuration file. (Default: "") 
    
      \x1b[1m'config' specific options:\x1b[0m

               dist=   Directory where the configuration will be saved. (Default: "./")
    
      \x1b[1mExamples\x1b[0m

        Create a custom CSS file:
        \x1b[1m$\x1b[0m tailwind-utopia 

        Create a custom CSS file with diferent options:
        \x1b[1m$\x1b[0m tailwind-utopia generate dist=./src/styles configPath=./src/configs
       
        Create a configuration file:
        \x1b[1m$\x1b[0m tailwind-utopia config

        Create a configuration file in a custom directory:
        \x1b[1m$\x1b[0m tailwind-utopia config dist=/src/config/styles

        Display help message:
        \x1b[1m$\x1b[0m tailwind-utopia --help
      `);
}
