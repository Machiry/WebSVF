*1. Setup nodeJS and SVF.*  

*2. Move the generateJSON.js, generateBugTxt.js, generateBCFile.js to the root path of SVF.*  

*3. Run following command line in the root path of SVF.*  

      node generateBCFile.js your_path_of_c_project_dir  
      
      node generateBugTxt.js  
      
      node generateJSON.js  
      
*4. Bug-Analysis-Report.json will be generated at the root path of SVF.*  
(Currently it can only work with multiple c files in one folder, but not the complex C project.)
      
