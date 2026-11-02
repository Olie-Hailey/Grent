Add-Type -AssemblyName System.Drawing

$width = 2400
$height = 1750

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Colors
$colNavy = [System.Drawing.Color]::FromArgb(15, 23, 42)
$colEmerald = [System.Drawing.Color]::FromArgb(5, 150, 105)
$colIndigo = [System.Drawing.Color]::FromArgb(49, 46, 129)
$colSlate = [System.Drawing.Color]::FromArgb(30, 41, 59)
$colBorder = [System.Drawing.Color]::FromArgb(203, 213, 225)
$colRowZebra = [System.Drawing.Color]::FromArgb(241, 245, 249)
$colWhite = [System.Drawing.Color]::White

$colPkBg = [System.Drawing.Color]::FromArgb(254, 240, 138) # Yellow
$colPkText = [System.Drawing.Color]::FromArgb(133, 77, 14)
$colFkBg = [System.Drawing.Color]::FromArgb(191, 219, 254) # Blue
$colFkText = [System.Drawing.Color]::FromArgb(30, 58, 138)
$colUkBg = [System.Drawing.Color]::FromArgb(187, 247, 208) # Green
$colUkText = [System.Drawing.Color]::FromArgb(20, 83, 45)

# Fonts
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 26, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Regular)
$fontMeta = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Italic)
$fontHeader = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontColName = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontColType = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Regular)
$fontColDesc = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$fontRel = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)

# Header Section
$brushTitle = New-Object System.Drawing.SolidBrush($colNavy)
$brushSub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))
$g.DrawString("DIAGRAM BASIS DATA (ENTITY-RELATIONSHIP DIAGRAM)", $fontTitle, $brushTitle, 80, 50)
$g.DrawString("Sistem Aplikasi Web Grent Gadget Rental - Format Variabel Disambiguasi (nama_namatabel)", $fontSubtitle, $brushSub, 80, 105)

# Legend Box
$legX = 1600
$legY = 45
$legBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255))
$legPen = New-Object System.Drawing.Pen($colBorder, 1)
$g.FillRectangle($legBrush, $legX, $legY, 720, 95)
$g.DrawRectangle($legPen, $legX, $legY, 720, 95)

$g.DrawString("Keterangan Penanda Kunci & Tipe Data:", $fontColName, $brushTitle, ($legX + 20), ($legY + 12))

# Legend Badges
function DrawBadge($gfx, $text, $x, $y, $bgCol, $textCol, $font) {
    $bgB = New-Object System.Drawing.SolidBrush($bgCol)
    $txtB = New-Object System.Drawing.SolidBrush($textCol)
    $gfx.FillRectangle($bgB, $x, $y, 38, 22)
    $pen = New-Object System.Drawing.Pen($textCol, 1)
    $gfx.DrawRectangle($pen, $x, $y, 38, 22)
    $gfx.DrawString($text, $font, $txtB, ($x + 7), ($y + 3))
}

DrawBadge $g "PK" ($legX + 20) ($legY + 48) $colPkBg $colPkText $fontBadge
$g.DrawString("Primary Key (Kunci Utama)", $fontColDesc, $brushSub, ($legX + 66), ($legY + 50))

DrawBadge $g "FK" ($legX + 270) ($legY + 48) $colFkBg $colFkText $fontBadge
$g.DrawString("Foreign Key (Kunci Tamu)", $fontColDesc, $brushSub, ($legX + 316), ($legY + 50))

DrawBadge $g "UK" ($legX + 510) ($legY + 48) $colUkBg $colUkText $fontBadge
$g.DrawString("Unique Key (Unik)", $fontColDesc, $brushSub, ($legX + 556), ($legY + 50))

# Helper to draw a full table entity
function DrawTableEntity($gfx, $title, $subtitle, $x, $y, $w, $h, $hdrCol, $columns) {
    # Shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 15, 23, 42))
    $gfx.FillRectangle($shadowBrush, ($x + 6), ($y + 6), $w, $h)

    # Box Card
    $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 1.5)
    $gfx.FillRectangle($cardBrush, $x, $y, $w, $h)
    $gfx.DrawRectangle($cardPen, $x, $y, $w, $h)

    # Header Card
    $hdrBrush = New-Object System.Drawing.SolidBrush($hdrCol)
    $gfx.FillRectangle($hdrBrush, $x, $y, $w, 55)

    # Header Text
    $txtWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $txtGold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 240, 138))
    $gfx.DrawString($title, $fontHeader, $txtWhite, ($x + 18), ($y + 8))
    $gfx.DrawString($subtitle, $fontColDesc, $txtGold, ($x + 18), ($y + 32))

    # Table sub-header row
    $subHdrY = $y + 55
    $subHdrBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))
    $gfx.FillRectangle($subHdrBrush, $x, $subHdrY, $w, 28)
    $gfx.DrawLine($cardPen, $x, ($subHdrY + 28), ($x + $w), ($subHdrY + 28))

    $txtSubHdr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    $fontSubHdr = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
    $gfx.DrawString("KEY", $fontSubHdr, $txtSubHdr, ($x + 15), ($subHdrY + 6))
    $gfx.DrawString("NAMA ATRIBUT UNIK", $fontSubHdr, $txtSubHdr, ($x + 65), ($subHdrY + 6))
    $gfx.DrawString("TIPE DATA", $fontSubHdr, $txtSubHdr, ($x + 270), ($subHdrY + 6))
    $gfx.DrawString("KETERANGAN", $fontSubHdr, $txtSubHdr, ($x + 395), ($subHdrY + 6))

    # Rows
    $rowY = $subHdrY + 28
    $rowH = 34
    $idx = 0
    foreach ($col in $columns) {
        $keyType = $col[0]
        $attrName = $col[1]
        $dataType = $col[2]
        $desc = $col[3]

        if ($idx % 2 -eq 1) {
            $zebraBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
            $gfx.FillRectangle($zebraBrush, ($x + 1), $rowY, ($w - 2), $rowH)
        }

        # Draw Key Badge
        if ($keyType -eq "PK") {
            DrawBadge $gfx "PK" ($x + 15) ($rowY + 6) $colPkBg $colPkText $fontBadge
        } elseif ($keyType -eq "FK") {
            DrawBadge $gfx "FK" ($x + 15) ($rowY + 6) $colFkBg $colFkText $fontBadge
        } elseif ($keyType -eq "UK") {
            DrawBadge $gfx "UK" ($x + 15) ($rowY + 6) $colUkBg $colUkText $fontBadge
        }

        # Attribute Name
        $txtAttr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
        $gfx.DrawString($attrName, $fontColName, $txtAttr, ($x + 65), ($rowY + 7))

        # Data Type
        $txtType = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 150, 105))
        $gfx.DrawString($dataType, $fontColType, $txtType, ($x + 270), ($rowY + 8))

        # Description
        $txtDesc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))
        $gfx.DrawString($desc, $fontColDesc, $txtDesc, ($x + 395), ($rowY + 8))

        $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(241, 245, 249), 1)
        $gfx.DrawLine($linePen, $x, ($rowY + $rowH), ($x + $w), ($rowY + $rowH))

        $rowY += $rowH
        $idx++
    }
}

# 1. PHONE TABLE COLUMNS
$phoneCols = @(
    @("PK", "id_phone", "String (CUID)", "ID unik unit gadget"),
    @("",   "model", "String", "Tipe seri (MacBook, iPhone, dll)"),
    @("",   "category", "String", "Laptop | Smartphone | Tablet"),
    @("",   "storage", "String", "Kapasitas RAM / SSD / ROM"),
    @("",   "color", "String", "Varian warna fisik unit"),
    @("",   "dailyPrice", "Int (Rupiah)", "Tarif sewa per 1 hari"),
    @("",   "weeklyPrice", "Int (Nullable)", "Tarif sewa per 7 hari (~15%)"),
    @("",   "monthlyPrice", "Int (Nullable)", "Tarif sewa per 30 hari (~35%)"),
    @("",   "stock", "Int (Dflt: 1)", "Jumlah unit stok fisik"),
    @("",   "description", "String", "Deskripsi spesifikasi lengkap"),
    @("",   "imageUrl", "String (Null)", "Path berkas foto unit"),
    @("",   "imageEmoji", "String", "Ikon visual cadangan"),
    @("",   "isActive", "Boolean", "Status aktif di katalog"),
    @("",   "createdAt_phone", "DateTime", "Timestamp pencatatan unit"),
    @("",   "updatedAt_phone", "DateTime", "Timestamp update unit")
)

# 2. CUSTOMER_PROFILE TABLE COLUMNS
$custCols = @(
    @("PK", "id_customer", "String (UUID)", "ID unik profil customer"),
    @("UK", "email_customer", "String (Unik)", "Email akun Google terdaftar"),
    @("",   "name_customer", "String", "Nama lengkap sesuai e-KTP"),
    @("",   "phone_customer", "String", "Nomor WhatsApp aktif pemesan"),
    @("",   "address_customer", "String", "Alamat tempat tinggal lengkap"),
    @("",   "birthInfo_customer", "String", "Tempat Tanggal Lahir (TTL)"),
    @("",   "idCardUrl_customer", "String", "URL file foto e-KTP asli"),
    @("",   "avatarUrl_customer", "String (Null)", "URL foto profil customer"),
    @("",   "isCompleted_customer", "Boolean", "Status kelengkapan KYC"),
    @("",   "createdAt_customer", "DateTime", "Waktu lengkapi profil"),
    @("",   "updatedAt_customer", "DateTime", "Waktu update profil")
)

# 3. RENTAL TABLE COLUMNS
$rentalCols = @(
    @("PK", "id_rental", "String (CUID)", "ID unik transaksi sewa"),
    @("FK", "phoneId", "String (FK)", "Referensi ke PHONE.id_phone"),
    @("",   "customerName_rental", "String", "Nama pemesan saat booking"),
    @("",   "customerPhone_rental", "String", "No telp kontak aktif rental"),
    @("FK", "customerEmail_rental", "String (FK)", "Referensi email_customer"),
    @("",   "startDate", "DateTime", "Tanggal mulai masa sewa"),
    @("",   "endDate", "DateTime", "Tanggal selesai masa sewa"),
    @("",   "rentalPackage", "String", "HARIAN | MINGGUAN | BULANAN"),
    @("",   "deliveryMethod", "String", "PICKUP | DELIVERY"),
    @("",   "deliveryAddress", "String (Null)", "Alamat kirim (jika antar)"),
    @("",   "paymentMethod", "String", "QRIS | CASH"),
    @("",   "paymentStatus", "String", "UNPAID | PAID"),
    @("",   "expiresAt", "DateTime (Null)", "Batas kedaluwarsa 24 jam"),
    @("",   "totalPrice", "Int (Rupiah)", "Total biaya kalkulasi server"),
    @("",   "status", "Enum", "PENDING | APPROVED | ACTIVE"),
    @("",   "notes", "String (Null)", "Catatan khusus pemesan"),
    @("",   "createdAt_rental", "DateTime", "Waktu pemesanan dibuat"),
    @("",   "updatedAt_rental", "DateTime", "Waktu pembaruan status")
)

# 4. ADMIN_PROFILE TABLE COLUMNS
$adminCols = @(
    @("PK", "id_admin", "String (UUID)", "ID unik staff operasional"),
    @("UK", "username_admin", "String (Unik)", "Username login admin"),
    @("",   "email_admin", "String", "Email resmi operasional toko"),
    @("",   "name_admin", "String", "Nama lengkap petugas staff"),
    @("",   "phone_admin", "String", "Hotline operasional toko"),
    @("",   "role_admin", "String", "Super Admin Operasional"),
    @("",   "branch_admin", "String", "Grent Margonda Raya, Depok"),
    @("",   "avatarUrl_admin", "String (Null)", "URL foto identitas staff"),
    @("",   "createdAt_admin", "DateTime", "Waktu akun admin dibuat"),
    @("",   "updatedAt_admin", "DateTime", "Waktu update profil admin")
)

# Draw the 4 tables
# Table 1: PHONE (Top Left)
DrawTableEntity $g "PHONE" "Entitas Master: Katalog & Stok Unit Gadget" 80 180 520 600 $colNavy $phoneCols

# Table 2: CUSTOMER_PROFILE (Top Right)
DrawTableEntity $g "CUSTOMER_PROFILE" "Entitas Master: Data Diri & Verifikasi KYC" 1280 180 540 464 $colEmerald $custCols

# Table 3: RENTAL (Bottom Left-Center)
DrawTableEntity $g "RENTAL" "Entitas Transaksi: Pemesanan & Pembayaran Sewa Gadget" 80 840 560 702 $colIndigo $rentalCols

# Table 4: ADMIN_PROFILE (Bottom Right)
DrawTableEntity $g "ADMIN_PROFILE" "Entitas Manajemen: Staff & Otorisasi Operasional" 1280 840 540 430 $colSlate $adminCols

# Draw Relationship Connectors & Annotations
$relPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(5, 150, 105), 3)
$relPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$relPenSolid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(79, 70, 229), 3)
$relPenAdmin = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(217, 119, 6), 3)
$relPenAdmin.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

# Connector 1: PHONE -> RENTAL (via phoneId)
# From PHONE bottom (X: 340, Y: 780) to RENTAL top (X: 340, Y: 840)
$g.DrawLine($relPenSolid, 340, 780, 340, 840)

# Connector Label 1
$boxBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238, 242, 255))
$boxPen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(79, 70, 229), 1)
$g.FillRectangle($boxBrush1, 230, 792, 220, 36)
$g.DrawRectangle($boxPen1, 230, 792, 220, 36)
$txtRel1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(67, 56, 202))
$g.DrawString("1 ke Banyak (One-to-Many)", $fontRel, $txtRel1, 240, 794)
$g.DrawString("PHONE.id_phone = RENTAL.phoneId", $fontBadge, $txtRel1, 240, 812)

# Connector 2: CUSTOMER_PROFILE -> RENTAL (via email)
# From CUSTOMER bottom-left (X: 1280, Y: 400) -> route through mid -> RENTAL right (X: 640, Y: 980)
$ptsCust = @(
    (New-Object System.Drawing.Point(1280, 240)),
    (New-Object System.Drawing.Point(900, 240)),
    (New-Object System.Drawing.Point(900, 980)),
    (New-Object System.Drawing.Point(640, 980))
)
$g.DrawLines($relPen, $ptsCust)

# Connector Label 2
$boxBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(236, 253, 245))
$boxPen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(5, 150, 105), 1)
$g.FillRectangle($boxBrush2, 750, 560, 300, 48)
$g.DrawRectangle($boxPen2, 750, 560, 300, 48)
$txtRel2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(6, 95, 70))
$g.DrawString("1 ke Banyak (One-to-Many)", $fontRel, $txtRel2, 760, 564)
$g.DrawString("CUSTOMER_PROFILE.email = RENTAL.customerEmail", $fontBadge, $txtRel2, 760, 586)

# Connector 3: ADMIN_PROFILE -> RENTAL (Control & Cash Confirmation)
# From ADMIN_PROFILE left (X: 1280, Y: 1040) -> RENTAL right (X: 640, Y: 1200)
$ptsAdmin = @(
    (New-Object System.Drawing.Point(1280, 1040)),
    (New-Object System.Drawing.Point(980, 1040)),
    (New-Object System.Drawing.Point(980, 1200)),
    (New-Object System.Drawing.Point(640, 1200))
)
$g.DrawLines($relPenAdmin, $ptsAdmin)

# Connector Label 3
$boxBrush3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 243, 199))
$boxPen3 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(217, 119, 6), 1)
$g.FillRectangle($boxBrush3, 750, 1070, 300, 48)
$g.DrawRectangle($boxPen3, 750, 1070, 300, 48)
$txtRel3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(146, 64, 14))
$g.DrawString("Verifikasi Operasional & Kasir", $fontRel, $txtRel3, 760, 1074)
$g.DrawString("ADMIN_PROFILE memverifikasi & konfirmasi bayar Cash", $fontBadge, $txtRel3, 760, 1096)

# Footer Info
$txtFoot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
$g.DrawString("Grent Gadget Rental - Dokumen Diagram Entity-Relationship Resmi (ERD)", $fontMeta, $txtFoot, 80, 1680)
$g.DrawString("Format Disambiguasi Kolom (nama_namatabel) | Resolusi Ultra-HD 2400x1750", $fontMeta, $txtFoot, 1750, 1680)

# Save as High-Quality JPEG
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

$outJpg1 = "C:\Users\LEGION\Projects\iphone-rental\erd_database_grent.jpg"
$outJpg2 = "C:\Users\LEGION\Projects\iphone-rental\public\erd_database_grent.jpg"
$outPng1 = "C:\Users\LEGION\Projects\iphone-rental\erd_database_grent.png"
$outPng2 = "C:\Users\LEGION\Projects\iphone-rental\public\erd_database_grent.png"

$bmp.Save($outJpg1, $encoder, $encoderParams)
$bmp.Save($outJpg2, $encoder, $encoderParams)
$bmp.Save($outPng1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outPng2, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Output "Successfully saved ERD JPG & PNG!"
