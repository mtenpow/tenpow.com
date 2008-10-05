using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Browser.Dom;
using System.Threading;
using System.Runtime.CompilerServices;

using Tenpow.Site.Utilities;

namespace Tenpow.Site.Twitter
{
    public class TwitterWall
    {
        private const string SearchUrl = "http://search.twitter.com/search.json";
        private const string ToMeCallback = "ToMeCallback";
        private const string FromMeCallback = "FromMeCallback";

        private IDomElement _container;
        private List<ISearchResultTweet> _tweets;
        private Dictionary<int, ISearchResultTweet> _index;
        private string _screenName;
        private int _maxItems;
        private string _toMeSearchParameters;
        private string _fromMeSearchParameters;
        private string _toMeSearchUrl;
        private string _fromMeSearchUrl;
        private int _uniqueUrlCounter = 0;

        public TwitterWall(string screenName, int maxItems)
        {
            _screenName = screenName;
            _maxItems = maxItems;
            _tweets = new List<ISearchResultTweet>();
            _index = new Dictionary<int, ISearchResultTweet>();
            _container = DomManager.Document.GetElementById("twitter-wall-container");

            _toMeSearchParameters = "&callback=" + ToMeCallback + "&count=" + maxItems;
            _toMeSearchUrl = SearchUrl + "?q=to:" + _screenName + _toMeSearchParameters;

            _fromMeSearchParameters = "&callback=" + FromMeCallback + "&count=" + maxItems;
            _fromMeSearchUrl = SearchUrl + "?q=from:" + _screenName + _fromMeSearchParameters;
        }

        public void DisplayLoading()
        {
            Logging.Info("Loading wall from twitter...");
            // TODO: Add beachball indicator
        }

        public void Refresh()
        {
            TwitterSearchResultsCallbackContext toMeCallbackContext = new TwitterSearchResultsCallbackContext();
            ExportDelegate(ToMeCallback, toMeCallbackContext.ExportedCallback);
            TwitterSearchResultsCallbackContext fromMeCallbackContext = new TwitterSearchResultsCallbackContext();
            ExportDelegate(FromMeCallback, fromMeCallbackContext.ExportedCallback);

            string uniqueToMeSearchUrl = _toMeSearchUrl + "&uniq=" + _uniqueUrlCounter;
            string uniqueFromMeSearchUrl = _fromMeSearchUrl + "&uniq=" + (_uniqueUrlCounter++);

            List<IDomElement> appendedScripts = new List<IDomElement>();

            appendedScripts.Add(AppendScript(uniqueToMeSearchUrl));
            appendedScripts.Add(AppendScript(uniqueFromMeSearchUrl));

            try
            {
                if (!toMeCallbackContext.CalledBack.WaitOne(10 * 1000))
                {
                    Logging.Info("Timed out waiting for: " + uniqueToMeSearchUrl);
                }
                if (!fromMeCallbackContext.CalledBack.WaitOne(10 * 1000))
                {
                    Logging.Info("Timed out waiting for: " + uniqueFromMeSearchUrl);
                }

                List<ISearchResultTweet> tweets = new List<ISearchResultTweet>();
                if (toMeCallbackContext.SearchResults != null)
                {
                    ISearchResults searchResults = toMeCallbackContext.SearchResults;
                    for (int i = 0; i < searchResults.Results.Length; i++)
                    {
                        tweets.Add(searchResults.Results[i]);
                    }
                    _toMeSearchUrl = SearchUrl + searchResults.RefreshUrl + _toMeSearchParameters;
                }
                if (fromMeCallbackContext.SearchResults != null)
                {
                    ISearchResults searchResults = fromMeCallbackContext.SearchResults;
                    for (int i = 0; i < searchResults.Results.Length; i++)
                    {
                        tweets.Add(searchResults.Results[i]);
                    }
                    _fromMeSearchUrl = SearchUrl + searchResults.RefreshUrl + _fromMeSearchParameters;
                }
                Update(tweets);
            }
            finally
            {
                for (int i = 0; i < appendedScripts.Count; i++)
                {
                    DomManager.GetDocumentElement().RemoveChild(appendedScripts[i]);
                }
            }
        }

        public void Update(List<ISearchResultTweet> tweets)
        {
            lock (this)
            {
                if (_tweets.Count == 0)
                {
                    _container.InnerHtml = "";
                }

                IDomDocument document = DomManager.Document;

                QuickSort.Sort<ISearchResultTweet>(tweets, delegate(ISearchResultTweet a, ISearchResultTweet b)
                {
                    return (int)(NativeDate.Parse(b.CreatedAt) - NativeDate.Parse(a.CreatedAt));
                });

                int max = Math.Min(tweets.Count, _maxItems);
                for (int i = max - 1; i >= 0; i--)
                {
                    ISearchResultTweet tweet = tweets[i];
                    if (_index.ContainsKey(tweet.Id))
                    {
                        continue;
                    }

                    Console.WriteLine("Displaying tweet: " + tweet.Text);

                    _tweets.Add(tweet);
                    _index[tweet.Id] = tweet;
                    IDomElement tweetElement = document.CreateElement("DIV");
                    tweetElement.InnerHtml = FormatTweet(tweet);
                    _container.InsertBefore(tweetElement, _container.FirstChild);
                }

                int tweetsToRemove = _tweets.Count - _maxItems;
                if (tweetsToRemove > 0)
                {
                    while (tweetsToRemove-- > 0)
                    {
                        _container.RemoveChild(_container.LastChild);
                    }
                    // TODO: Write a List<T> to remove method.  For now just copy the list
                    List<ISearchResultTweet> newTweets = new List<ISearchResultTweet>();
                    for (int i = 0; i < _maxItems; i++)
                    {
                        newTweets[i] = _tweets[i];
                    }
                    _tweets = newTweets;
                }
            }
        }

        private string FormatTweet(ISearchResultTweet tweet)
        {
            return "<table border=\"0\"><tr>" +
                "<td><img src=\"" + tweet.ProfileImageUrl + "\" height=\"26\" width=\"26\"></td>" +
                "<td>" + tweet.Text + "<br /><span style=\"color:blue;\">" + TimeSince(tweet) + "</span></td>" +
                "</tr></table>";
        }

        private string TimeSince(ISearchResultTweet tweet)
        {
            long tweetTime = NativeDate.Parse(tweet.CreatedAt);
            NativeDate now = new NativeDate();
            long deltaSeconds = (long)Math.Floor((now.GetTime() - tweetTime) / 1000);
            deltaSeconds += (now.GetTimezoneOffset() * 60);
            if (deltaSeconds < 60)
            {
                return "less than a minute ago";
            }
            else if (deltaSeconds < 120)
            {
                return "about a minute ago";
            }
            else if (deltaSeconds < (60 * 60))
            {
                return Math.Floor(deltaSeconds / 60).ToString() + " minutes ago";
            }
            else if (deltaSeconds < (120 * 60))
            {
                return "about an hour ago";
            }
            else if (deltaSeconds < (24 * 60 * 60))
            {
                return "about " + (Math.Floor(deltaSeconds / 3600)).ToString() + " hours ago";
            }
            else if (deltaSeconds < (48 * 60 * 60))
            {
                return "1 day ago";
            }
            else
            {
                return (Math.Floor(deltaSeconds / 86400)).ToString() + " days ago";
            }
        }

        private static IDomElement AppendScript(string url)
        {
            IDomElement documentElement = DomManager.GetDocumentElement();
            IDomElement newScriptElement = DomManager.CreateElement("SCRIPT");
            newScriptElement.SetAttribute("type", "text/javascript");
            newScriptElement.SetAttribute("src", url);
            documentElement.AppendChild(newScriptElement);
            return newScriptElement;
        }

        private class TwitterSearchResultsCallbackContext
        {
            public ISearchResults SearchResults;
            public ManualResetEvent CalledBack;

            public TwitterSearchResultsCallbackContext()
            {
                CalledBack = new ManualResetEvent();
            }

            [XaeiOSMethodImpl(MethodImplOptions.NonPreemptive)]
            public void ExportedCallback(ISearchResults results)
            {
                SearchResults = results;
                CalledBack.Set();
            }

        }

        [XaeiOSMethodImpl(MethodImplOptions.Inline, Implementation = "window[{0}] = {1}")]
        private static extern void ExportDelegate(string name, TwitterSearchResultsCallback d);
    }
}
