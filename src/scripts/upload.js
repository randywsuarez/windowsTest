export default `
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
      $headers.Add("tenant", "${params.tenant}")
      $headers.Add("Authorization", "Bearer ${params.token}")
      $headers.Add("Cookie", "ARRAffinity=9392b2366e7e292b2d3d255a990371852c7f338d552708093b1d04da72aa9ba2; ARRAffinitySameSite=9392b2366e7e292b2d3d255a990371852c7f338d552708093b1d04da72aa9ba2")

      $multipartContent = [System.Net.Http.MultipartFormDataContent]::new()
      $multipartFile = '${params.filePath}'
      $FileStream = [System.IO.FileStream]::new($multipartFile, [System.IO.FileMode]::Open)
      $fileHeader = [System.Net.Http.Headers.ContentDispositionHeaderValue]::new("form-data")
      $fileHeader.Name = ""
      $fileHeader.FileName = "${params.fileName}"
      $fileContent = [System.Net.Http.StreamContent]::new($FileStream)
      $fileContent.Headers.ContentDisposition = $fileHeader
      $multipartContent.Add($fileContent)

      $body = $multipartContent

      $response = Invoke-RestMethod '${params.apiUrl}' -Method 'POST' -Headers $headers -Body $body
      $response | ConvertTo-Json

`
