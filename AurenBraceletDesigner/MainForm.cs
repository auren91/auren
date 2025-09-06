using System;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Windows.Forms;
using AurenBraceletDesigner.Data;
using AurenBraceletDesigner.Models;

namespace AurenBraceletDesigner
{
    public class MainForm : Form
    {
        private ComboBox cbChain;
        private Label lblChainPrice;
        private TrackBar tbLength;
        private NumericUpDown nudLength;
        private Label lblLengthValue;
        private TextBox txtSearch;
        private ComboBox cbCategory;
        private ListBox lbCatalog;
        private Button btnAddCharm;

        private ListView lvSelected;
        private Button btnUp;
        private Button btnDown;
        private Button btnRemove;
        private Button btnClearAll;

        private PictureBox pbPreview;
        private Label lblSubtotalChain;
        private Label lblSubtotalCharms;
        private Label lblTotal;
        private Button btnSaveJson;
        private Button btnLoadJson;
        private Button btnExportPng;
        private Button btnCopySummary;

        private readonly BraceletConfig CurrentConfig = new BraceletConfig();
        private readonly CultureInfo mx = CultureInfo.CreateSpecificCulture("es-MX");

        private const string SearchPlaceholder = "Buscar charms...";

        public MainForm()
        {
            InitializeComponent();
            cbChain.DataSource = Catalog.Chains.ToList();
            cbChain.DisplayMember = "Name";
            cbChain.SelectedIndex = 0;
            CurrentConfig.SelectedChain = (Chain)cbChain.SelectedItem;

            cbCategory.Items.AddRange(new[] { "Todos", "letras", "amor", "zodiaco", "animales", "otros" });
            cbCategory.SelectedIndex = 0;

            tbLength.Minimum = 14;
            tbLength.Maximum = 24;
            tbLength.Value = 16;
            nudLength.Minimum = 14;
            nudLength.Maximum = 24;
            nudLength.Value = 16;
            nudLength.DecimalPlaces = 1;
            nudLength.Increment = 1;

            SetupSearchPlaceholder();

            CurrentConfig.LengthCm = nudLength.Value;
            RefreshChainInfo();
            RefreshCatalogList();
            RefreshSelectedList();
            RefreshPrices();
            RedrawPreview();
        }

        private void InitializeComponent()
        {
            Text = "Auren Bracelet Designer";
            MinimumSize = new Size(1000, 700);

            var panelLeft = new Panel { Dock = DockStyle.Left, Width = 300, Padding = new Padding(10) };
            var panelCenter = new Panel { Dock = DockStyle.Left, Width = 350, Padding = new Padding(10) };
            var panelRight = new Panel { Dock = DockStyle.Fill, Padding = new Padding(10) };

            // Left panel controls
            var lblChain = new Label { Text = "Cadena", AutoSize = true };
            cbChain = new ComboBox { DropDownStyle = ComboBoxStyle.DropDownList, Width = 260 };
            lblChainPrice = new Label { AutoSize = true };

            var lblLength = new Label { Text = "Longitud", AutoSize = true, Top = 70 };
            tbLength = new TrackBar { Minimum = 14, Maximum = 24, TickStyle = TickStyle.BottomRight, Width = 260, Top = 90 };
            nudLength = new NumericUpDown { Minimum = 14, Maximum = 24, DecimalPlaces = 1, Increment = 1, Width = 60, Left = 200, Top = 140 };
            lblLengthValue = new Label { AutoSize = true, Top = 170 };

            txtSearch = new TextBox { Width = 260, Top = 200 };
            cbCategory = new ComboBox { DropDownStyle = ComboBoxStyle.DropDownList, Width = 260, Top = 230 };

            lbCatalog = new ListBox { Width = 260, Height = 250, Top = 260 }; 
            btnAddCharm = new Button { Text = "Agregar >>", Width = 260, Top = 520 };

            panelLeft.Controls.AddRange(new Control[] { lblChain, cbChain, lblChainPrice, lblLength, tbLength, nudLength, lblLengthValue, txtSearch, cbCategory, lbCatalog, btnAddCharm });

            // Center panel controls
            lvSelected = new ListView { View = View.Details, Width = 320, Height = 400 };
            lvSelected.Columns.Add("Charm", 120);
            lvSelected.Columns.Add("Categor\u00eda", 100);
            lvSelected.Columns.Add("Precio", 80);
            lvSelected.FullRowSelect = true;
            lvSelected.MultiSelect = false;

            btnUp = new Button { Text = "Subir", Width = 90, Top = 410 };
            btnDown = new Button { Text = "Bajar", Width = 90, Left = 100, Top = 410 };
            btnRemove = new Button { Text = "Quitar", Width = 90, Left = 200, Top = 410 };
            btnClearAll = new Button { Text = "Limpiar", Width = 90, Left = 0, Top = 450 };

            panelCenter.Controls.AddRange(new Control[] { lvSelected, btnUp, btnDown, btnRemove, btnClearAll });

            // Right panel controls
            pbPreview = new PictureBox { Width = 300, Height = 300, BorderStyle = BorderStyle.FixedSingle, Left = 20, Top = 20 };

            var lblChainSubtotalTitle = new Label { Text = "Cadena:", AutoSize = true, Top = 330 };
            lblSubtotalChain = new Label { AutoSize = true, Left = 80, Top = 330 };
            var lblCharmsSubtotalTitle = new Label { Text = "Charms:", AutoSize = true, Top = 360 };
            lblSubtotalCharms = new Label { AutoSize = true, Left = 80, Top = 360 };
            var lblTotalTitle = new Label { Text = "Total:", AutoSize = true, Top = 390, Font = new Font(Font, FontStyle.Bold) };
            lblTotal = new Label { AutoSize = true, Left = 80, Top = 390, Font = new Font(Font, FontStyle.Bold) };

            btnSaveJson = new Button { Text = "Guardar JSON", Width = 140, Top = 430 };
            btnLoadJson = new Button { Text = "Cargar JSON", Width = 140, Left = 150, Top = 430 };
            btnExportPng = new Button { Text = "Exportar PNG", Width = 140, Top = 470 };
            btnCopySummary = new Button { Text = "Copiar resumen", Width = 140, Left = 150, Top = 470 };

            panelRight.Controls.AddRange(new Control[] { pbPreview, lblChainSubtotalTitle, lblSubtotalChain, lblCharmsSubtotalTitle, lblSubtotalCharms, lblTotalTitle, lblTotal, btnSaveJson, btnLoadJson, btnExportPng, btnCopySummary });

            Controls.AddRange(new Control[] { panelLeft, panelCenter, panelRight });

            // Events
            cbChain.SelectedIndexChanged += (s, e) => { CurrentConfig.SelectedChain = (Chain)cbChain.SelectedItem; RefreshChainInfo(); RefreshPrices(); RedrawPreview(); };
            tbLength.Scroll += (s, e) => { nudLength.Value = tbLength.Value; UpdateLength(); };
            nudLength.ValueChanged += (s, e) => { if (nudLength.Value >= tbLength.Minimum && nudLength.Value <= tbLength.Maximum) tbLength.Value = (int)nudLength.Value; UpdateLength(); };
            txtSearch.TextChanged += (s, e) => RefreshCatalogList();
            cbCategory.SelectedIndexChanged += (s, e) => RefreshCatalogList();
            btnAddCharm.Click += (s, e) => AddSelectedCharm();
            lvSelected.SelectedIndexChanged += (s, e) => UpdateButtons();
            btnRemove.Click += (s, e) => RemoveSelectedCharm();
            btnClearAll.Click += (s, e) => { CurrentConfig.SelectedCharms.Clear(); RefreshSelectedList(); RefreshPrices(); RedrawPreview(); };
            btnUp.Click += (s, e) => MoveSelected(-1);
            btnDown.Click += (s, e) => MoveSelected(1);
            btnSaveJson.Click += (s, e) => SaveJson();
            btnLoadJson.Click += (s, e) => LoadJson();
            btnExportPng.Click += (s, e) => ExportPng();
            btnCopySummary.Click += (s, e) => CopySummary();
        }

        private void SetupSearchPlaceholder()
        {
            txtSearch.ForeColor = Color.Gray;
            txtSearch.Text = SearchPlaceholder;
            txtSearch.GotFocus += (s, e) =>
            {
                if (txtSearch.Text == SearchPlaceholder)
                {
                    txtSearch.Text = string.Empty;
                    txtSearch.ForeColor = Color.Black;
                }
            };
            txtSearch.LostFocus += (s, e) =>
            {
                if (string.IsNullOrWhiteSpace(txtSearch.Text))
                {
                    txtSearch.ForeColor = Color.Gray;
                    txtSearch.Text = SearchPlaceholder;
                }
            };
        }

        private void RefreshChainInfo()
        {
            lblChainPrice.Text = CurrentConfig.SelectedChain.Price.ToString("C", mx);
        }

        private void UpdateLength()
        {
            CurrentConfig.LengthCm = nudLength.Value;
            lblLengthValue.Text = $"Longitud: {CurrentConfig.LengthCm:F1} cm";
            RefreshPrices();
            RedrawPreview();
        }

        private void RefreshCatalogList()
        {
            lbCatalog.Items.Clear();
            var search = txtSearch.Text;
            if (search == SearchPlaceholder) search = string.Empty;
            var category = cbCategory.SelectedItem?.ToString().ToLowerInvariant();
            foreach (var charm in Catalog.AllCharms)
            {
                if (!string.IsNullOrEmpty(search) && !charm.Name.ToLowerInvariant().Contains(search.ToLowerInvariant()))
                    continue;
                if (category != null && category != "todos" && charm.Category != category)
                    continue;
                lbCatalog.Items.Add(charm);
            }
        }

        private void AddSelectedCharm()
        {
            if (lbCatalog.SelectedItem is Charm charm)
            {
                CurrentConfig.SelectedCharms.Add(charm);
                RefreshSelectedList();
                RefreshPrices();
                RedrawPreview();
            }
        }

        private void RefreshSelectedList()
        {
            lvSelected.Items.Clear();
            foreach (var charm in CurrentConfig.SelectedCharms)
            {
                var lvi = new ListViewItem(charm.Name) { Tag = charm };
                lvi.SubItems.Add(charm.Category);
                lvi.SubItems.Add(charm.Price.ToString("C", mx));
                lvSelected.Items.Add(lvi);
            }
            UpdateButtons();
        }

        private void UpdateButtons()
        {
            bool hasSel = lvSelected.SelectedIndices.Count > 0;
            btnUp.Enabled = hasSel && lvSelected.SelectedIndices[0] > 0;
            btnDown.Enabled = hasSel && lvSelected.SelectedIndices[0] < lvSelected.Items.Count - 1;
            btnRemove.Enabled = hasSel;
        }

        private void RemoveSelectedCharm()
        {
            if (lvSelected.SelectedIndices.Count == 0) return;
            int idx = lvSelected.SelectedIndices[0];
            CurrentConfig.SelectedCharms.RemoveAt(idx);
            RefreshSelectedList();
            RefreshPrices();
            RedrawPreview();
        }

        private void MoveSelected(int delta)
        {
            if (lvSelected.SelectedIndices.Count == 0) return;
            int idx = lvSelected.SelectedIndices[0];
            int newIdx = idx + delta;
            if (newIdx < 0 || newIdx >= CurrentConfig.SelectedCharms.Count) return;
            var charm = CurrentConfig.SelectedCharms[idx];
            CurrentConfig.SelectedCharms.RemoveAt(idx);
            CurrentConfig.SelectedCharms.Insert(newIdx, charm);
            RefreshSelectedList();
            lvSelected.Items[newIdx].Selected = true;
            RefreshPrices();
            RedrawPreview();
        }

        private void RefreshPrices()
        {
            var chainPrice = CurrentConfig.SelectedChain?.Price ?? 0m;
            var charmsPrice = CurrentConfig.SelectedCharms.Sum(c => c.Price);
            lblSubtotalChain.Text = chainPrice.ToString("C", mx);
            lblSubtotalCharms.Text = charmsPrice.ToString("C", mx);
            lblTotal.Text = (chainPrice + charmsPrice).ToString("C", mx);
        }

        private void RedrawPreview()
        {
            if (pbPreview.Width == 0 || pbPreview.Height == 0) return;
            pbPreview.Image?.Dispose();
            pbPreview.Image = GeneratePreviewBitmap(pbPreview.Width, pbPreview.Height);
        }

        private Bitmap GeneratePreviewBitmap(int width, int height)
        {
            var bmp = new Bitmap(width, height);
            using (var g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                g.Clear(Color.White);
                var chain = CurrentConfig.SelectedChain ?? Catalog.Chains.First();
                float diameter = 240f + (float)((CurrentConfig.LengthCm - 16m) * 8m);
                float radius = diameter / 2f;
                float cx = width / 2f;
                float cy = height / 2f;
                var rect = new RectangleF(cx - radius, cy - radius, diameter, diameter);
                using (var pen = new Pen(chain.BaseColor, 6f))
                {
                    g.DrawEllipse(pen, rect);
                }
                var charms = CurrentConfig.SelectedCharms;
                if (charms.Count == 0)
                {
                    TextRenderer.DrawText(g, "Agrega charms...", Font, new Rectangle(0, 0, width, height), Color.Gray, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
                }
                else
                {
                    float charmSize = 32f;
                    for (int i = 0; i < charms.Count; i++)
                    {
                        double theta = i * (2 * Math.PI / charms.Count) - Math.PI / 2;
                        float x = (float)(cx + (radius - charmSize / 2) * Math.Cos(theta) - charmSize / 2);
                        float y = (float)(cy + (radius - charmSize / 2) * Math.Sin(theta) - charmSize / 2);
                        var charm = charms[i];
                        var rectCharm = new RectangleF(x, y, charmSize, charmSize);
                        if (!string.IsNullOrEmpty(charm.ImagePath) && File.Exists(charm.ImagePath))
                        {
                            try
                            {
                                using var img = Image.FromFile(charm.ImagePath);
                                g.DrawImage(img, rectCharm);
                            }
                            catch { }
                        }
                        else if (!string.IsNullOrEmpty(charm.Emoji))
                        {
                            TextRenderer.DrawText(g, charm.Emoji, Font, Rectangle.Round(rectCharm), Color.Black, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
                        }
                    }
                }
            }
            return bmp;
        }

        private void SaveJson()
        {
            using var sfd = new SaveFileDialog { Filter = "Bracelet JSON|*.json" };
            if (sfd.ShowDialog() == DialogResult.OK)
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                var json = JsonSerializer.Serialize(CurrentConfig, options);
                File.WriteAllText(sfd.FileName, json);
            }
        }

        private void LoadJson()
        {
            using var ofd = new OpenFileDialog { Filter = "Bracelet JSON|*.json" };
            if (ofd.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    var json = File.ReadAllText(ofd.FileName);
                    var cfg = JsonSerializer.Deserialize<BraceletConfig>(json);
                    if (cfg != null)
                    {
                        var chain = Catalog.Chains.FirstOrDefault(c => c.Id == cfg.SelectedChain?.Id) ?? Catalog.Chains.First();
                        CurrentConfig.SelectedChain = chain;
                        cbChain.SelectedItem = chain;
                        CurrentConfig.LengthCm = cfg.LengthCm;
                        tbLength.Value = (int)Math.Min(Math.Max(cfg.LengthCm, tbLength.Minimum), tbLength.Maximum);
                        nudLength.Value = tbLength.Value;

                        CurrentConfig.SelectedCharms.Clear();
                        int skipped = 0;
                        foreach (var ch in cfg.SelectedCharms)
                        {
                            var match = Catalog.AllCharms.FirstOrDefault(x => x.Id == ch.Id);
                            if (match != null) CurrentConfig.SelectedCharms.Add(match); else skipped++;
                        }
                        RefreshSelectedList();
                        RefreshCatalogList();
                        RefreshChainInfo();
                        RefreshPrices();
                        RedrawPreview();
                        if (skipped > 0)
                            MessageBox.Show($"{skipped} charms no existen en el cat\u00e1logo actual y fueron omitidos.", "Informaci\u00f3n");
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error al cargar archivo: " + ex.Message);
                }
            }
        }

        private void ExportPng()
        {
            using var sfd = new SaveFileDialog { Filter = "PNG Image|*.png" };
            if (sfd.ShowDialog() == DialogResult.OK)
            {
                using var bmp = GeneratePreviewBitmap(pbPreview.Width, pbPreview.Height);
                bmp.Save(sfd.FileName, System.Drawing.Imaging.ImageFormat.Png);
            }
        }

        private void CopySummary()
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Cadena: {CurrentConfig.SelectedChain.Name} ({CurrentConfig.SelectedChain.Price.ToString("C", mx)})");
            sb.AppendLine($"Longitud: {CurrentConfig.LengthCm:F1} cm");
            sb.AppendLine("Charms:");
            foreach (var c in CurrentConfig.SelectedCharms)
                sb.AppendLine($" - {c.Name} ({c.Price.ToString("C", mx)})");
            var chainPrice = CurrentConfig.SelectedChain.Price;
            var charmsPrice = CurrentConfig.SelectedCharms.Sum(c => c.Price);
            sb.AppendLine($"Subtotal cadena: {chainPrice.ToString("C", mx)}");
            sb.AppendLine($"Subtotal charms: {charmsPrice.ToString("C", mx)}");
            sb.AppendLine($"Total: {(chainPrice + charmsPrice).ToString("C", mx)}");
            Clipboard.SetText(sb.ToString());
        }
    }
}
