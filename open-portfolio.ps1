$ErrorActionPreference = 'SilentlyContinue'

$portfolioProject = 'C:\Users\zyq\Desktop\YONG-QI-Portfolio'
$portfolioHome = 'http://localhost:3000/'
$portfolioCases = 'http://localhost:3000/#cases'

function Test-PortfolioPreview {
  try {
    $response = Invoke-WebRequest -Uri $portfolioHome -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200
  }
  catch {
    return $false
  }
}

if (-not (Test-PortfolioPreview)) {
  Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c', 'npm.cmd run dev') -WorkingDirectory $portfolioProject -WindowStyle Hidden

  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 500
    if (Test-PortfolioPreview) {
      break
    }
  }
}

Start-Process $portfolioCases
