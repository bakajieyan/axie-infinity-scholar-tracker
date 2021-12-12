import { FaFacebook, FaDiscord, FaInstagram, FaTwitter, FaTelegram } from 'react-icons/fa';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import profile from '../images/profile.jpg';

import theme from '../theme';

function AboutDialog(props) {
    const { open, onClose } = props;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>About</DialogTitle>
            <DialogContent>
                <Typography>
                    This is a scholar tracker for{' '}
                    <a
                        href="https://axieinfinity.com/"
                        style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                    >
                        Ape Army Guild
					</a>
					.
				</Typography>
                <br />
                <Typography>
                    Data provided by{' '}
                    <a
                        href="https://skymavis.com/"
                        style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                    >
                        Sky Mavis
					</a>
					. Crypto prices courtesy of{' '}
                    <a
                        href="https://www.coingecko.com/en/api"
                        style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                    >
                        CoinGecko
					</a>
					.
				</Typography>
                <br />
                
                <Box
                    sx={{
                        display: 'flex',
                        textDecoration: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 4,
                    }}>
                    <Typography color="text.primary" sx={{ fontSize: 50 }}>
                        <a
                            style={{ textDecoration: 'none', color: theme.palette.primary.main, margin: '10px' }}
                            href="https://github.com/vlipatdev"
                        >
                            <FaFacebook />
                        </a>
                        <a
                            style={{ textDecoration: 'none', color: theme.palette.primary.main, margin: '10px' }}
                            href="https://github.com/vlipatdev"
                        >
                            <FaTwitter />
                        </a>
                        <a
                            style={{ textDecoration: 'none', color: theme.palette.primary.main, margin: '10px' }}
                            href="https://github.com/vlipatdev"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            style={{ textDecoration: 'none', color: theme.palette.primary.main, margin: '10px' }}
                            href="https://github.com/vlipatdev"
                        >
                            <FaTelegram />
                        </a>
                        <a
                            style={{ textDecoration: 'none', color: theme.palette.primary.main, margin: '10px' }}
                            href="https://github.com/vlipatdev"
                        >
                            <FaDiscord />
                        </a>
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 4,
                    }}
                >
                    <Typography color="text.primary" sx={{ fontSize: 14 }}>
                        forked from{' '}
                        <a
                            style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                            href="https://github.com/vlipatdev"
                        >
                            vlipatdev
						</a>{' '}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Okay</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AboutDialog;
