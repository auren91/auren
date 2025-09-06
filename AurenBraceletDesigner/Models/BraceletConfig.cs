using System.Collections.Generic;

namespace AurenBraceletDesigner.Models
{
    public class BraceletConfig
    {
        public Chain SelectedChain { get; set; }
        public decimal LengthCm { get; set; }
        public List<Charm> SelectedCharms { get; set; } = new List<Charm>();
    }
}
