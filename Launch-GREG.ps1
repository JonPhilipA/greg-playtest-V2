param([switch]$Developer, [switch]$NoBrowser, [int]$Port = 48731)
$ErrorActionPreference = 'Stop'
$gameRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'game'))
$rootPrefix = $gameRoot + [IO.Path]::DirectorySeparatorChar
$baseUrl = 'http://127.0.0.1:' + $Port
$gameUrl = $baseUrl + '/?curriculum=1'
if ($Developer) { $gameUrl += '&dev=1' }
$listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $Port)
try { $listener.Start(128) }
catch {
    try {
        $existing = Invoke-RestMethod -Uri ($baseUrl + '/preview-info.json') -TimeoutSec 2
        if ($existing.preview -eq 'GREG_Professor_Preview') {
            if (-not $NoBrowser) { Start-Process -FilePath $gameUrl }
            Write-Host 'The professor preview is already running.'
            Write-Host $gameUrl
            exit 0
        }
    } catch {}
    Write-Host ('Could not start the preview on port ' + $Port + '. Close its previous launcher window and try again.')
    exit 1
}
Write-Host 'G.R.E.G. - A Breath of Brass | Professor Preview'
Write-Host $gameUrl
Write-Host 'Keep this window open while playing. Close it or press Ctrl+C to stop.'
if (-not $NoBrowser) { Start-Process -FilePath $gameUrl }
$mime = @{
    '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'
    '.css'='text/css; charset=utf-8'; '.json'='application/json; charset=utf-8'
    '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.webp'='image/webp'
    '.wav'='audio/wav'; '.ogg'='audio/ogg'; '.mp3'='audio/mpeg'; '.ico'='image/x-icon'
    '.woff2'='font/woff2'
}
try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $reader = $null
        try {
            $client.ReceiveTimeout = 4000
            $client.SendTimeout = 10000
            $stream = $client.GetStream()
            $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
            $line = $reader.ReadLine()
            if (-not $line) { continue }
            $request = $line.Split(' ')
            do { $header = $reader.ReadLine() } while ($null -ne $header -and $header -ne '')
            $status = '200 OK'
            $contentType = 'text/plain; charset=utf-8'
            $data = [Text.Encoding]::UTF8.GetBytes('Not found')
            if ($request[0] -ne 'GET' -and $request[0] -ne 'HEAD') {
                $status = '405 Method Not Allowed'
                $data = [Text.Encoding]::UTF8.GetBytes('Use GET or HEAD.')
            } else {
                $urlPath = [Uri]::UnescapeDataString(($request[1] -split '\?')[0])
                if ($urlPath -eq '/') { $urlPath = '/index.html' }
                $relative = $urlPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
                $target = [IO.Path]::GetFullPath((Join-Path $gameRoot $relative))
                if (-not $target.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
                    $status = '403 Forbidden'
                    $data = [Text.Encoding]::UTF8.GetBytes('Forbidden')
                } elseif (Test-Path -LiteralPath $target -PathType Leaf) {
                    $data = [IO.File]::ReadAllBytes($target)
                    $extension = [IO.Path]::GetExtension($target).ToLowerInvariant()
                    $contentType = $mime[$extension]
                    if (-not $contentType) { $contentType = 'application/octet-stream' }
                } else { $status = '404 Not Found' }
            }
            $response = 'HTTP/1.1 ' + $status + "`r`nContent-Type: " + $contentType +
                "`r`nContent-Length: " + $data.Length + "`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
            $bytes = [Text.Encoding]::ASCII.GetBytes($response)
            $stream.Write($bytes, 0, $bytes.Length)
            if ($request[0] -ne 'HEAD') { $stream.Write($data, 0, $data.Length) }
            $stream.Flush()
        } catch {
            # A browser may abandon a request while navigating.
        } finally {
            if ($reader) { $reader.Dispose() }
            $client.Close()
        }
    }
} finally { $listener.Stop() }
