# Usage Guide for Modules in `/src/boot/`

This documentation explains how to use each of the modules available in the `/src/boot/` folder of the **windowsTest_A** project. These modules are loaded during application startup and provide essential functionality for the system.

## Table of Contents

1. [axios.js](#axiosjs) – HTTP Client  
2. [cmd.js](#cmdjs) – PowerShell Command Execution  
3. [db.js](#dbjs) – Database Management  
4. [env.js](#envjs) – Environment Variables  
5. [i18n.js](#i18njs) – Internationalization  
6. [image.js](#imagejs) – Image Handling  
7. [MSSQL.js](#mssqljs) – SQL Server Connection  
8. [rsNeDB.js](#rsnedbjs) – Local JSON Database  
9. [systemInformation.js](#systeminformationjs) – System Information  
10. [txt.js](#txtjs) – Text File Handling  

---

## axios.js

This module configures Axios for making HTTP requests.

### Import

```javascript
// No need to import it directly; it’s available globally as this.$axios
```

### Usage

```javascript
// Perform a GET request
this.$axios.get('https://api.example.com/data')
  .then(response => {
    console.log(response.data)
  })
  .catch(error => {
    console.error(error)
  })

// Perform a POST request
this.$axios.post('https://api.example.com/data', {
  name: 'Example',
  value: 123
})
```

---

## cmd.js

This module allows you to execute PowerShell commands and scripts from the application.

### Usage

```javascript
// Execute a PowerShell command
this.$cmd.executeCommand('Get-Process').then(result => {
  console.log(result)
})

// Execute PowerShell script code
this.$cmd.executeScriptCode(`
  $computerSystem = Get-CimInstance CIM_ComputerSystem
  $computerSystem | ConvertTo-Json
`).then(result => {
  console.log(JSON.parse(result))
})
```

### Available Functions

- `executeCommand(command)`: Executes a PowerShell command.  
- `executeScriptCode(scriptCode)`: Runs a block of PowerShell script.  
- `checkComponentsPresence(fileContent)`: Checks for the presence of specific components in file content.  

---

## db.js

This module provides an interface for interacting with databases.

### Import

```javascript
// No need to import it directly; it’s available globally as this.$db
```

### Usage

```javascript
// Create a DB instance for a collection
const users = this.$db.collection('users')

// Get all documents
users.get().then(docs => {
  console.log(docs)
})

// Get a specific document
users.doc('id123').get().then(doc => {
  console.log(doc)
})

// Add a document
users.add({
  name: 'Sample User',
  email: 'user@example.com'
}).then(docRef => {
  console.log('Added document with ID:', docRef.id)
})

// Update a document
users.doc('id123').update({
  name: 'Updated Name'
})

// Delete a document
users.doc('id123').delete()
```

---

## env.js

This module provides access to the application’s environment variables.

### Import

```javascript
// No need to import it directly; it’s available globally as this.$env
```

### Usage

```javascript
// Access environment variables
console.log(this.$env.database.server) // Database server
console.log(this.$env.api.url)         // API base URL
```

---

## i18n.js

This module configures internationalization (i18n) for the application.

### Import

```javascript
import { i18n } from 'src/boot/i18n'
```

### Usage

```html
<!-- In Vue components -->
<template>
  <div>{{ $t('message.welcome') }}</div>
</template>
```

```javascript
// Change the locale
this.$i18n.locale = 'es-es'

// Get a translation programmatically
const welcomeMsg = this.$t('message.welcome')
```

---

## image.js

This module enables uploading and saving images.

### Usage

```javascript
// Upload an image (base64 data)
this.$uploadImage('device_image.jpg', 'data:image/jpeg;base64,/9j/4AAQSkZJRg...')

// Access info about the uploaded image
console.log(this.$imageFile.name) // File name
console.log(this.$imageFile.path) // Full file path
```

---

## MSSQL.js

This module provides an interface to connect to and query SQL Server databases.

### Usage

```javascript
// Create an instance for a specific database
const db = new this.$RsDB('DatabaseName')

// Execute a raw SQL query
db.executeQuery('SELECT * FROM Users WHERE active = 1')
  .then(results => {
    console.log(results)
  })
  .catch(error => {
    console.error('Query error:', error)
  })

// Use the query builder
db.select('id, name, email')
  .from('Users')
  .where('active = 1')
  .orderBy('name ASC')
  .execute()
  .then(results => {
    console.log(results)
  })
```

---

## rsNeDB.js

This module provides a local, file-based JSON database.

### Usage

```javascript
// Create an instance for a specific database
const db = new this.$RsNeDB('myLocalDb')

// Insert a document
db.insert({ name: 'Example', value: 123 })
  .then(newDoc => {
    console.log('Inserted document:', newDoc)
  })

// Find documents
db.find({ name: 'Example' })
  .then(docs => {
    console.log('Found documents:', docs)
  })

// Find a single document
db.findOne({ _uid: 'id123' })
  .then(doc => {
    console.log('Found document:', doc)
  })

// Update documents
db.update({ name: 'Example' }, { $set: { value: 456 } })
  .then(updatedCount => {
    console.log('Number of documents updated:', updatedCount)
  })

// Remove documents
db.remove({ name: 'Example' })
  .then(removedCount => {
    console.log('Number of documents removed:', removedCount)
  })
```

---

## systemInformation.js

This module provides detailed information about the system’s hardware and software.

### Usage

```javascript
// Get BIOS, system, and motherboard info
this.$si.getSystemBiosBaseboard()
  .then(info => {
    console.log('System:', info.system)
    console.log('BIOS:', info.bios)
    console.log('Baseboard:', info.baseboard)
  })

// Get full system information
this.$si.getSystemInfo()
  .then(info => {
    console.log('CPU:', info.cpu)
    console.log('Memory:', info.mem)
    console.log('Graphics:', info.graphics)
    console.log('Disks:', info.diskLayout)
    console.log('Network:', info.networkInterfaces)
    // And many more available details
  })
```

---

## txt.js

This module enables creating and saving text files.

### Usage

```javascript
// Create and save a text file
this.$uploadTextFile('device_report', 'Full device report content...')

// Access info about the saved file
console.log(this.$textFile.original.name)    // Original file name
console.log(this.$textFile.original.path)    // Full file path
console.log(this.$textFile.base64.content)   // Base64-encoded content
```

---

## Combined Usage Example

Here’s an example of how you might use several of these boot modules together in a Vue component:

```javascript
export default {
  name: 'TestComponent',
  data() {
    return {
      deviceInfo: null,
      testResults: {}
    }
  },
  async mounted() {
    // Get full system info
    this.deviceInfo = await this.$si.getSystemInfo()
    
    // Save system info to the database
    const devices = this.$db.collection('devices')
    const docRef = await devices.add({
      serial: this.deviceInfo.system.serial,
      model: this.deviceInfo.system.model,
      testDate: new Date()
    })
    
    // Execute a PowerShell script to check Windows licensing
    const windowsStatus = await this.$cmd.executeScriptCode(`
      $license = Get-CimInstance SoftwareLicensingProduct |
        Where-Object { $_.PartialProductKey -and $_.Name -like '*Windows*' }
      $license | ConvertTo-Json
    `)
    this.testResults.windows = JSON.parse(windowsStatus)
    
    // Save the results to a text file
    this.$uploadTextFile(
      this.deviceInfo.system.serial,
      JSON.stringify(this.testResults, null, 2)
    )
    
    // Show a notification in the user’s language
    this.$q.notify({
      message: this.$t('test.completed'),
      color: 'positive'
    })
  }
}
```

## Important Considerations

- All of these modules are available globally in Vue components via the `this` context.  
- Some modules require system permissions to function properly (especially `cmd.js` and `systemInformation.js`).  
- The database modules (`db.js`, `MSSQL.js`, `rsNeDB.js`) offer different storage options depending on your needs.  
- For file handling (`image.js`, `txt.js`), ensure the application has write permissions for the target directories.