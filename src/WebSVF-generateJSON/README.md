1. Setup nodeJS and SVF.*  

2. Move the generateJSON.js to the root path of SVF.*  

3. Use WLLVM to compile a C project to LLVM Bitcode (.bc) file.*  

4. Run following command line in the root path of SVF.*  

      
       node generateJSON.js your_path_of_c_project  
      
      
5. Bug-Analysis-Report.json will be generated at the root path of your C project.*  

The example of your_path_of_c_project: (Make sure you have compile a C project to LLVM Bitcode (.bc) successfully).*  

       node generateJSON.js /home/pie/Downloads/pkg-config-0.26

The way to compile a C project to LLVM Bitcode (.bc): [Detecting memory leaks](https://github.com/SVF-tools/SVF/wiki/Detecting-memory-leaks) (Step 2)
