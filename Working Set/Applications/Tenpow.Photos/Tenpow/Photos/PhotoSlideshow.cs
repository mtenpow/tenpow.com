using System;
using System.Threading;
using System.Collections.Generic;
using System.Diagnostics;
using System.Browser.Dom;

namespace Tenpow.Photos
{
    public class PhotoSlideshow
    {
        public Photo[] Photos
        {
            get;
            private set;
        }

        private int _currentPhotoIndex = -1;
        private Thread _slideshowThread;
        private bool _slideshowStarted = false;
        private int _slideshowInterval;

        public PhotoSlideshow(Photo[] photos, int slideshowInterval)
        {
            if (photos == null)
            {
                throw new ArgumentException("photos cannot be null");
            }
            if (photos.Length == 0)
            {
                throw new ArgumentException("must supply at least 1 photo");
            }
            Photos = photos;
            _slideshowInterval = slideshowInterval;
        }

        public void StartSlideshow()
        {
            if (_slideshowStarted)
            {
                throw new Exception("Slideshow already started");
            }
            _slideshowStarted = true;
            _slideshowThread = Thread.CurrentThread;
            SlideshowLoop();
        }

        public void ShowPhoto(int index)
        {
            if (index > Photos.Length || index < 0)
            {
                throw new ArgumentOutOfRangeException("index");
            }
            _currentPhotoIndex = index;
            
            Photo photo = Photos[index];
            
            IDomDocument document = DomManager.Document;
            IDomElement photoContainer = document.GetElementById("photo-container");
            photoContainer.InnerHtml = "<a href=\"" + photo.Url + "\"><img src=\"" + photo.Url + "\" alt=\"" + photo.Caption + "\" border=\"0\" title=\"" + photo.Caption + "\" /></a>";
            IDomElement photoCaptionContainer = document.GetElementById("photo-caption");
            photoCaptionContainer.InnerHtml = "<b>" + photo.Caption + "</b>";
            IDomElement photoIndexContainer = document.GetElementById("photo-index");
            photoIndexContainer.InnerHtml = "Photo " + (index + 1) + " of " + Photos.Length;
            
            Console.WriteLine("Showing photo " + photo);
        }

        public void ShowNextPhoto()
        {
            DoShowNextPhoto();
            ResetSlideshowLoop();
        }

        public void ShowPreviousPhoto()
        {
            DoShowPreviousPhoto();
            ResetSlideshowLoop();
        }

        private void DoShowNextPhoto()
        {
            int nextPhotoIndex = _currentPhotoIndex + 1;
            if (nextPhotoIndex >= Photos.Length)
            {
                // wrap around if we've reached the end
                nextPhotoIndex = 0;
            }
            ShowPhoto(nextPhotoIndex);
        }

        private void DoShowPreviousPhoto()
        {
            int previousPhotoIndex = _currentPhotoIndex - 1;
            if (previousPhotoIndex < 0)
            {
                // wrap around if we've reached the beginning
                previousPhotoIndex = Photos.Length - 1;
            }
            ShowPhoto(previousPhotoIndex);
        }

        private void ResetSlideshowLoop()
        {
            if (_slideshowStarted)
            {
                _slideshowThread.Abort();
            }
        }

        private void SlideshowLoop()
        {
            while (true)
            {
                try
                {
                    Logging.Info("Sleeping for " + _slideshowInterval + " milliseconds");
                    Thread.Sleep(_slideshowInterval);
                    DoShowNextPhoto();
                    // TODO: Use a thread interrupted exception here instead
                }
                catch (ThreadAbortException e)
                {
                    Logging.Info("Caught exception: " + e);
                }
            }
        }
    }
}
