$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if ($nodeCommand) {
  & $nodeCommand.Source "$PSScriptRoot\build-injected-bundle.mjs"
  exit $LASTEXITCODE
}

$bundledNode = Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if (Test-Path $bundledNode) {
  & $bundledNode "$PSScriptRoot\build-injected-bundle.mjs"
  exit $LASTEXITCODE
}

Write-Error "Node.js was not found on PATH and the Codex bundled runtime was unavailable."
exit 1
