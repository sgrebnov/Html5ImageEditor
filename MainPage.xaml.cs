using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using Microsoft.Phone.Controls;


namespace ImageEditor
{
    public partial class MainPage : PhoneApplicationPage
    {
        // Constructor
        public MainPage()
        {
            InitializeComponent();
            this.PGView.Loaded += GapBrowser_Loaded;
        }

        private void GapBrowser_Loaded(object sender, RoutedEventArgs e)
        {
            this.PGView.Loaded -= GapBrowser_Loaded;
            Storyboard _storyBoard = new Storyboard();
            DoubleAnimation animation = new DoubleAnimation()
            {
                From = 0,
                Duration = TimeSpan.FromSeconds(0.6),
                To = 90
            };
            Storyboard.SetTarget(animation, SplashProjector);
            Storyboard.SetTargetProperty(animation, new PropertyPath("RotationY"));
            _storyBoard.Children.Add(animation);
            _storyBoard.Begin();
            _storyBoard.Completed += Splash_Completed;

            WebBrowser _browser = this.PGView.Browser;

            var border0 = VisualTreeHelper.GetChild(_browser, 0);
            var border1 = VisualTreeHelper.GetChild(border0, 0);
            var panZoom = VisualTreeHelper.GetChild(border1, 0);
            var grid = VisualTreeHelper.GetChild(panZoom, 0);

            var border = VisualTreeHelper.GetChild(grid, 0) as Border;


            if (border != null)
            {
                //border.ManipulationStarted += Border_ManipulationStarted;
                border.ManipulationDelta += Border_ManipulationDelta;
                border.ManipulationCompleted += Border_ManipulationCompleted;
                //border.DoubleTap += Border_DoubleTap;
                //border.Hold += Border_Hold;
                //border.MouseLeftButtonDown += Border_MouseLeftButtonDown;
            }

        }

        void Splash_Completed(object sender, EventArgs e)
        {
            (sender as Storyboard).Completed -= Splash_Completed;
            LayoutRoot.Children.Remove(SplashImage);
        }

        private void Border_ManipulationCompleted(object sender,
                                           ManipulationCompletedEventArgs e)
        {
            // suppress zoom
            //if (e.FinalVelocities.ExpansionVelocity.X != 0.0 ||
            //    e.FinalVelocities.ExpansionVelocity.Y != 0.0)
            //    e.Handled = true;
        }

        private void Border_ManipulationDelta(object sender,
                                              ManipulationDeltaEventArgs e)
        {
            // suppress zoom
            //if (e.DeltaManipulation.Scale.X != 0.0 ||
            //    e.DeltaManipulation.Scale.Y != 0.0)
            //    e.Handled = true;

            //// optionally suppress scrolling
            //if (ScrollDisabled)
            //{
            //    if (e.DeltaManipulation.Translation.X != 0.0 ||
            //      e.DeltaManipulation.Translation.Y != 0.0)
            //        e.Handled = true;
            //}
        }
    }
}