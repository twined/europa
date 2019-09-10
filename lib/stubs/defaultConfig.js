"use strict";

module.exports = {
  theme: {
    breakpoints: {
      xs: '0',
      sm: '740px',
      md: '1024px',
      lg: '1399px',
      xl: '1900px'
    },
    containers: {
      maxWidth: {
        xs: '740px',
        sm: '1024px',
        md: '100%',
        lg: '100%',
        xl: '100%'
      },
      padding: {
        xs: '15px',
        sm: '35px',
        md: '50px',
        lg: '100px',
        xl: '100px'
      }
    },
    colors: {
      transparent: 'transparent',
      black: '#000',
      white: '#fff'
    },
    fonts: {
      sansSerif: 'Moderat, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;',
      serif: 'Noe, serif'
    },
    header: {
      padding: {
        /* When header is small */
        small: {
          xs: {
            padding: '30px 0'
          },
          sm: {
            padding: '40px 0'
          },
          md: {
            padding: '40px 0 35px'
          },
          lg: {
            padding: '40px 0 35px'
          },
          xl: {
            padding: '60px 0'
          }
        },

        /* When header is large */
        large: {
          xs: {
            padding: '15px 0'
          },
          sm: {
            padding: '40px 0'
          },
          md: {
            padding: '40px 0'
          },
          lg: {
            padding: '70px 0 40px'
          },
          xl: {
            padding: '80px 0 60px'
          }
        }
      }
    },
    spacing: {
      /* this is per SIZE followed by per BREAKPOINT */
      xs: {
        xs: '10px',
        sm: '15px',
        md: '15px',
        lg: '15px',
        xl: '15px'
      },
      sm: {
        xs: '20px',
        sm: '25px',
        md: '30px',
        lg: '30px',
        xl: '45px'
      },
      md: {
        xs: '35px',
        sm: '40px',
        md: '50px',
        lg: '50px',
        xl: '70px'
      },
      lg: {
        xs: '50px',
        sm: '50px',
        md: '75px',
        lg: '75px',
        xl: '120px'
      },
      xl: {
        xs: '85px',
        sm: '100px',
        md: '140px',
        lg: '140px',
        xl: '180px'
      }
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem'
    },
    fontWeight: {
      hairline: '100',
      thin: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },
    width: theme => ({
      auto: 'auto',
      ...theme('spacing'),
      '1/2': '50%',
      '1/3': '33.333333%',
      '2/3': '66.666667%',
      '1/4': '25%',
      '2/4': '50%',
      '3/4': '75%',
      '1/5': '20%',
      '2/5': '40%',
      '3/5': '60%',
      '4/5': '80%',
      '1/6': '16.666667%',
      '2/6': '33.333333%',
      '3/6': '50%',
      '4/6': '66.666667%',
      '5/6': '83.333333%',
      '1/12': '8.333333%',
      '2/12': '16.666667%',
      '3/12': '25%',
      '4/12': '33.333333%',
      '5/12': '41.666667%',
      '6/12': '50%',
      '7/12': '58.333333%',
      '8/12': '66.666667%',
      '9/12': '75%',
      '10/12': '83.333333%',
      '11/12': '91.666667%',
      full: '100%',
      screen: '100vw'
    })
  }
};