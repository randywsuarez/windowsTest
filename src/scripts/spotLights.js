export default `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
function spotLightsLinesTest {
    # Variable externa para almacenar el resultado
    $global:result = $null

    # Crear el formulario
    $form = New-Object System.Windows.Forms.Form
    $form.Text = 'Changing Colors..'
    $form.ControlBox = $False
    $form.WindowState = 'Maximized'
    $form.FormBorderStyle = 'None'
    $form.Anchor = "None"
    $form.StartPosition = "CenterScreen"
    $form.TopMost = $true
    $form.SuspendLayout()

    # Función para manejar el clic en el botón "Pass"
    $passClick = {
        $global:result = @{
            result = 'PASS'
        }
        $form.Close()
    }

    # Función para manejar el clic en el botón "Fail"
    $failClick = {
        $global:result = @{
            result = 'FAIL'
        }
        $form.Close()
    }

    # Crear botón para Pass
    $btnOK = New-Object System.Windows.Forms.Button
    $btnOK.Anchor = 'Top','Left'
    $btnOK.Size = [System.Drawing.Size]::new(120, 31)
    $btnOK.Location = [System.Drawing.Point]::new($form.Width / 2 - $btnOK.Width - 8, 150)
    $btnOK.Text = 'PASS'
    $btnOK.UseVisualStyleBackColor = $true
    $btnOK.Add_Click($passClick)
    $form.Controls.Add($btnOK)

    # Crear botón para Fail
    $btnFail = New-Object System.Windows.Forms.Button
    $btnFail.Anchor = 'Top','Left'
    $btnFail.Size = [System.Drawing.Size]::new(120, 31)
    $btnFail.Location = [System.Drawing.Point]::new($form.Width / 2 - $btnFail.Width - 8, 180)
    $btnFail.Text = 'FAIL'
    $btnFail.UseVisualStyleBackColor = $true
    $btnFail.Add_Click($failClick)
    $form.Controls.Add($btnFail)

    # Configurar el color de fondo cambiante
    $timer = New-Object System.Windows.Forms.Timer
    $timer.Interval = 1000   # Intervalo de 1 segundo
    $timer.Enabled = $false  # Iniciar deshabilitado
    $timer.Tag = -1          # Inicializar el índice de color
    $timer.Add_Tick({
        $colors = 'Red', 'Green', 'Blue', 'Black', 'White'
        # Obtener un índice aleatorio de color diferente al anterior
        $index = Get-Random -Maximum $colors.Count
        if ($index -eq $this.Tag){
            $index = ($index + 1) % $colors.Count
        }
        $this.Tag = $index
        $form.BackColor = $colors[$index]
    })

    # Mostrar el formulario
    $form.Add_Shown({
        $timer.Enabled = $true
        $timer.Start()
    })
    [void]$form.ShowDialog()

    # Limpieza: eliminar el temporizador y el formulario
    $timer.Dispose()
    $form.Dispose()

    # Devolver el resultado como JSON
    $global:result | ConvertTo-Json
}

# Llamar a la función y almacenar el resultado
$resultado = spotLightsLinesTest

# Imprimir el resultado
Write-Output $resultado
`
