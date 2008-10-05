using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;

namespace Tenpow.Site.Twitter
{
    [NativeDelegate]
    public delegate void TwitterSearchResultsCallback(ISearchResults results);
}
