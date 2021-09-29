import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

function ExportButton() {
	return (
		<Button sx={{ margin: 1 }} variant="outlined" color="success" startIcon={<DownloadIcon />}>
			Export Excel CSV
		</Button>
	);
}

export default ExportButton;
