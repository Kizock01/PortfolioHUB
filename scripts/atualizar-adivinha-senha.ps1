$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = 'C:\Users\gbast\OneDrive\Documentos\PortfolioHUB'
$prefix = 'projetos-academicos/adivinha-senha'
$remote = 'amigo-adivinha-senha'
$branch = 'main'

Set-Location -LiteralPath $repoRoot

$expectedRoot = [System.IO.Path]::GetFullPath($repoRoot)
$gitRoot = (git rev-parse --show-toplevel).Trim()
$normalizedGitRoot = [System.IO.Path]::GetFullPath(($gitRoot -replace '/', '\'))
if ($normalizedGitRoot -ne $expectedRoot) {
    throw "Git root mismatch. Expected: $expectedRoot | Current: $normalizedGitRoot"
}

Write-Host 'Estado atual do repositorio:'
git status

$statusLines = @(git status --porcelain=v1)
$outsideChanges = @()
$insideChanges = @()

foreach ($line in $statusLines) {
    if ([string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    $path = $line.Substring(3)
    if ($line -match '^R.') {
        $parts = $path -split ' -> '
        $path = $parts[-1]
    }

    if ($path -like "$prefix/*" -or $path -eq $prefix) {
        $insideChanges += $line
    } else {
        $outsideChanges += $line
    }
}

if ($outsideChanges.Count -gt 0) {
    Write-Host ''
    Write-Host 'Abortado: existem arquivos modificados fora de projetos-academicos/adivinha-senha.' -ForegroundColor Yellow
    $outsideChanges | ForEach-Object { Write-Host $_ }
    exit 1
}

if ($insideChanges.Count -gt 0) {
    Write-Host ''
    Write-Host 'Abortado: existem mudancas locais dentro de projetos-academicos/adivinha-senha. Faca commit/stash antes de atualizar.' -ForegroundColor Yellow
    $insideChanges | ForEach-Object { Write-Host $_ }
    exit 1
}

$beforeHead = (git rev-parse HEAD).Trim()

Write-Host ''
Write-Host "Buscando atualizacoes de $remote/$branch..."
git fetch $remote

Write-Host ''
Write-Host "Aplicando git subtree pull em $prefix..."
git subtree pull --prefix=$prefix $remote $branch

$afterHead = (git rev-parse HEAD).Trim()

Write-Host ''
Write-Host 'Resumo das mudancas trazidas pelo pull:'
git diff --stat $beforeHead $afterHead

$changedFiles = @(git diff --name-only $beforeHead $afterHead)
$unexpectedFiles = @(
    $changedFiles | Where-Object {
        $_ -and $_ -ne $prefix -and $_ -notlike "$prefix/*"
    }
)

Write-Host ''
if ($unexpectedFiles.Count -gt 0) {
    Write-Host 'Atencao: houve mudancas fora de projetos-academicos/adivinha-senha.' -ForegroundColor Yellow
    $unexpectedFiles | ForEach-Object { Write-Host $_ }
    exit 1
}

Write-Host 'Atualizacao concluida com mudancas apenas em projetos-academicos/adivinha-senha.' -ForegroundColor Green
