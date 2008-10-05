using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;

namespace Tenpow.Site.Twitter
{
    [Intrinsic]
    public interface ISearchResults
    {
        [Intrinsic("results")]
        NativeArray<ISearchResultTweet> Results
        {
            get;
        }

        [Intrinsic("since_id")]
        int SinceId
        {
            get;
        }

        [Intrinsic("max_id")]
        int MaxId
        {
            get;
        }

        [Intrinsic("refresh_url")]
        string RefreshUrl
        {
            get;
        }

        [Intrinsic("query")]
        string Query
        {
            get;
        }

    }
}
