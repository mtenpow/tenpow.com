﻿using System;
using System.Collections.Generic;
using System.Threading;
using System.Runtime.InteropServices;
using System.Runtime.CompilerServices;
using System.Browser.Dom;
using System.Diagnostics;

using XaeiOS;
using XaeiOS.Process;
using XaeiOS.ProcessViewer;

using Tenpow.Site.Photos;
using Tenpow.Site.Twitter;

namespace Tenpow.Site
{
    class Program
    {

        private static void Main(string[] args)
        {
            StartProcessViewer();
            StartPhotoSlideshow();
            StartTwitterWall();
        }

        private static void StartProcessViewer()
        {
            SIP processViewerSIP = new SIP(delegate()
            {
                Logging.Info("Starting XaeiOS.ProcessViewer");
                ProcessViewer processViewer = new ProcessViewer();
                processViewer.UpdateInterval = 2000;
                processViewer.Start();
            }, ThreadPriority.Normal, "XaeiOS.ProcessViewer");
            processViewerSIP.Start();
        }

        #region Photo Slideshow
        private static PhotoSlideshow _slideshow;
        private static int _slideshowPid;
        static void StartPhotoSlideshow()
        {
            SIP slideshowProcess = new SIP(delegate()
            {
                // TODO: Fetch photo database from an XML/JSON file using REST
                Photo[] photos = new Photo[]{
                    new Photo("Photos/michaelten-pow.jpg", "My two sisters, Kaya and Alicia, and me"),
                    new Photo("Photos/lounging_at_pool.jpg", "Lounging by the pool at the Planet Hollywood Hotel, Las Vegas"),
                    new Photo("Photos/coaster.jpg", "Autumn and me on the roller coaster at New York, New York, Las Vegas"),
                    new Photo("Photos/just_michael.jpg", "Just me"),
                    new Photo("Photos/paris_vegas.jpg", "Autumn and me at Paris, Las Vegas"),
                    new Photo("Photos/checking_in.jpg", "Checking into the Planet Hollywood Hotel, Las Vegas"),
                    new Photo("Photos/autumn_and_michael.jpg", "Autumn and me"),
                    new Photo("Photos/wii_at_earls.jpg", "Playing Wii Sports Golf at Earl's house"),
                    new Photo("Photos/packed_jeep.jpg", "My Jeep packed full of my cousin Michelle's belongings.  I was helping her move.")
                };

                _slideshow = new PhotoSlideshow(photos, 10 * 1000);
                SignalDaemon.Start();
                ExportDelegate("ShowNextPhoto", ExportedShowNextPhoto);
                ExportDelegate("ShowPreviousPhoto", ExportedShowPreviousPhoto);
                _slideshow.ShowPhoto(0);
                _slideshow.StartSlideshow();
            }, ThreadPriority.Normal, "Tenpow.PhotoSlideshow");

            // install a custom signal handler to call the appropriate method based upon the PhotoSlideshowSignal that we receive
            slideshowProcess.CustomSignal += delegate(int data)
            {
                PhotoSlideshowSignal signal = (PhotoSlideshowSignal)data;
                if (signal == PhotoSlideshowSignal.ShowNextPhoto)
                {
                    _slideshow.ShowNextPhoto();
                }
                else if (signal == PhotoSlideshowSignal.ShowPreviousPhoto)
                {
                    _slideshow.ShowPreviousPhoto();
                }
                else
                {
                    // TODO: Write to standard error
                    Console.WriteLine("Received unknown signal " + data);
                }
            };
            slideshowProcess.Start();
            _slideshowPid = slideshowProcess.PID;
        }

        [XaeiOSMethodImpl(MethodImplOptions.NonPreemptive)]
        static void ExportedShowNextPhoto()
        {
            SignalDaemon.SendSignal(_slideshowPid, Signal.Custom, (int)PhotoSlideshowSignal.ShowNextPhoto);
        }

        [XaeiOSMethodImpl(MethodImplOptions.NonPreemptive)]
        static void ExportedShowPreviousPhoto()
        {
            SignalDaemon.SendSignal(_slideshowPid, Signal.Custom, (int)PhotoSlideshowSignal.ShowPreviousPhoto);
        }

        private enum PhotoSlideshowSignal : int
        {
            ShowNextPhoto = 1,
            ShowPreviousPhoto = 2
        }

        [XaeiOSMethodImpl(MethodImplOptions.Inline, Implementation = "window[{0}] = {1}")]
        static extern void ExportDelegate(string name, NativeVoidDelegate d);

        #endregion

        #region TwitterWall
        private static void StartTwitterWall()
        {
            SIP twitterWallProcess = new SIP(delegate()
            {
                string screenName = "mtenpow";
                int maxItems = 6;
                TwitterWall twitterWall = new TwitterWall(screenName, maxItems);
                twitterWall.DisplayLoading();
                int refreshInterval = 20 * 1000;
                while (true)
                {
                    twitterWall.Refresh();
                    Logging.Info("TwitterWall will refresh in " + (refreshInterval / 1000) + " seconds");
                    Thread.Sleep(refreshInterval);
                }
            }, ThreadPriority.Normal, "Tenpow.TwitterWall");
            twitterWallProcess.Start();
        }

        #endregion

    }
}
