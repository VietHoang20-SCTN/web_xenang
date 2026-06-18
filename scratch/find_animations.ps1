$file = 'd:\Project\xenang\src\styles.css'
Write-Host "=== @keyframes ==="
Select-String -Path $file -Pattern '@keyframes' | ForEach-Object { Write-Host "$($_.LineNumber): $($_.Line.Trim())" }
Write-Host ""
Write-Host "=== :hover (first 40) ==="
$count = 0
Select-String -Path $file -Pattern ':hover' | ForEach-Object {
    if ($count -lt 40) {
        Write-Host "$($_.LineNumber): $($_.Line.Trim())"
        $count++
    }
}
