import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import FileSaver from 'file-saver';

import '../styles/App.css';

import NavBar from './NavBar';
import BasicCard from './BasicCard';
import Form from './Form';
import DataTable from './DataTable';
import ExportButton from './ExportButton';
import SortSelect from './SortSelect';
import SortTypeSelect from './SortTypeSelect';
import Footer from './Footer';

import styled from '@mui/material/styles/styled';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

import axieLogo from '../assets/images/axie_logo.png';
import axie from '../assets/images/axie.png';
import slpLogo from '../assets/images/slp_logo.png';
import ethereumLogo from '../assets/images/ethereum_logo.png';
import axsLogo from '../assets/images/axs_logo.png';

import {
	calculateAverageSlp,
	calculateLastClaimInDays,
	processDate,
	calculateNextClaimInDays,
	calculateManagerShare,
	calculateScholarShare,
	calculateTotal,
	calculateScholarPercent,
	sortArray,
	addCommasToNumber,
} from '../helpers';

const Input = styled('input')({
	display: 'none',
});

function App() {
	const [addresses, setAddresses] = useState([]);
	const [data, setData] = useState([]);
	const [localData, setLocalData] = useState([]);
	const [localSettings, setLocalSettings] = useState({ sort_by: 'name', sort_type: 'ascending' });
	const [cryptoData, setCryptoData] = useState({
		'smooth-love-potion': {
			php: 0,
			php_24h_change: 0,
			usd: 0,
			usd_24h_change: 0,
		},
		ethereum: {
			php: 0,
			php_24h_change: 0,
			usd: 0,
			usd_24h_change: 0,
		},
		'axie-infinity': {
			php: 0,
			php_24h_change: 0,
			usd: 0,
			usd_24h_change: 0,
		},
	});
	const [isDelete, setIsDelete] = useState(false);
	const [currency, setCurrency] = useState('php');

	const BASE_URL = 'https://game-api.axie.technology/api/v1/';

	let sortedData;

	if (localSettings.sort_type === 'ascending') {
		sortedData = sortArray(data, localSettings.sort_by);
	} else {
		sortedData = sortArray(data, localSettings.sort_by).reverse();
	}

	// onload
	useEffect(() => {
		// get local data
		const localStorageData = JSON.parse(localStorage.getItem('profiles'));
		if (localStorageData) {
			setAddresses(localStorageData.map((item) => item.ronin_address));
			setLocalData(localStorageData);
		}

		// get local settings
		const localStorageSettings = JSON.parse(localStorage.getItem('settings'));
		if (localStorageSettings) {
			setLocalSettings(localStorageSettings);
		}

		console.log('useEffect get local storage');
	}, []);

	useEffect(() => {
		// update addresess
		setAddresses(localData.map((item) => item.ronin_address));

		// update local storage
		localStorage.setItem('profiles', JSON.stringify(localData));

		console.log('useEffect update local data');
	}, [localData]);

	useEffect(() => {
		localStorage.setItem('settings', JSON.stringify(localSettings));

		console.log('useEffect update local settings');
	}, [localSettings]);

	useEffect(() => {
		const finalUrl = BASE_URL + addresses.join('%2C');

		if (addresses.length !== 0) {
			if (!isDelete) {
				console.log('fetching slp data...');

				// fetch slp data
				axios
					.get(finalUrl)
					.then((response) => {
						let dataArray;

						if (addresses.length === 1) {
							dataArray = [response.data];
						} else {
							dataArray = Object.values(response.data);
						}
						const finalData = dataArray.map((dataItem, index) => {
							return {
								last_updated: processDate(dataItem.cache_last_updated),
								name: localData[index].name,

								ronin_address: localData[index].ronin_address,
								average_slp: calculateAverageSlp(
									dataItem.in_game_slp,
									calculateLastClaimInDays(dataItem.last_claim)
								),
								unclaimed_slp: dataItem.in_game_slp,
								claimed_slp: dataItem.total_slp - dataItem.in_game_slp,
								total_slp: dataItem.total_slp,
								last_claim_in_days: calculateLastClaimInDays(dataItem.last_claim),
								last_claim_date: processDate(parseInt(`${dataItem.last_claim}000`)),
								last_claim_raw: parseInt(`${dataItem.last_claim}000`),
								next_claim_in_days: calculateNextClaimInDays(dataItem.next_claim),
								next_claim_date: processDate(parseInt(`${dataItem.next_claim}000`)),
								next_claim_raw: dataItem.next_claim,
								manager_percent: parseInt(localData[index].manager_share),
								scholar_percent: calculateScholarPercent(localData[index].manager_share),
								manager_share: calculateManagerShare(
									dataItem.total_slp,
									localData[index].manager_share
								),
								scholar_share: calculateScholarShare(
									dataItem.total_slp,
									calculateScholarPercent(localData[index].manager_share)
								),
								mmr: dataItem.mmr,
								rank: dataItem.rank,
							};
						});
						setData(finalData);
					})
					.catch((error) => {
						alert('Could not connect to server. Please try again later.');
					});
			} else {
				setData(data.filter((dataItem) => addresses.includes(dataItem.ronin_address)));
			}
		} else {
			document.body.style.cursor = 'default';
			setData([]);
		}

		// fetch crypto prices
		axios
			.get(
				'https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Caxie-infinity%2Csmooth-love-potion&vs_currencies=php%2Cusd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=true&include_last_updated_at=false'
			)
			.then((response) => {
				setCryptoData(response.data);
			})
			.catch((error) => {
				alert('Error fetching crypto data. Please try again later.');
			});

		console.log('useEffect update addresses');
	}, [addresses]);

	function handleUpdate(data, isDelete) {
		setLocalData(data);
		setIsDelete(isDelete);
	}

	function handleJSONDownload(data) {
		const fileName = 'scholars.json';
		const fileToSave = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		});

		FileSaver.saveAs(fileToSave, fileName);
	}

	function handleJSONUpload(event) {
		const fileReader = new FileReader();
		if (event.target.files[0]) {
			fileReader.readAsText(event.target.files[0], 'UTF-8');
			fileReader.onload = (event) => {
				setIsDelete(false);
				const JSONdata = JSON.parse(event.target.result);
				if (JSONdata[0].name && JSONdata[0].ronin_address && JSONdata[0].manager_share) {
					setLocalData(JSONdata);
				} else if (JSONdata[0].name && JSONdata[0].eth && JSONdata[0].managerShare) {
					const convertedJSONData = JSONdata.map((item) => {
						return {
							name: item.name,
							ronin_address: item.eth,
							manager_share: item.managerShare,
						};
					});
					setLocalData(convertedJSONData);
				} else {
					alert(
						'Incompatible JSON structure.\n\nOnly exported JSON from this site and https://axie-scho-tracker.vercel.app/ are accepted at the moment.\n\nSupport for other trackers will be added in the future.'
					);
				}
			};
		}
	}

	function cleanData(data) {
		return data.map((item) => {
			const {
				last_updated,
				ronin_address,
				name,
				average_slp,
				unclaimed_slp,
				claimed_slp,
				total_slp,
				last_claim_date,
				next_claim_date,
				manager_percent,
				scholar_percent,
				manager_share,
				scholar_share,
				mmr,
				rank,
			} = item;

			return {
				last_updated,
				name,
				ronin_address,
				average_slp,
				unclaimed_slp,
				claimed_slp,
				total_slp,
				last_claim_date,
				next_claim_date,
				manager_percent,
				scholar_percent,
				manager_share,
				scholar_share,
				mmr,
				rank,
			};
		});
	}

	function handleSortUpdate(event) {
		const { name, value } = event.target;
		setLocalSettings((prevSettings) => {
			return { ...prevSettings, [name]: value };
		});
	}

	return (
		<Box sx={{ flexGrow: 1 }}>
			<NavBar />
			<Box
				sx={{
					height: '200px',
					backgroundColor: '#1976D2',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					mb: 2,
					backgroundImage: `url('https://www.transparenttextures.com/patterns/axiom-pattern.png')`,
				}}
			>
				<img src={axieLogo} alt="axie logo" style={{ height: '75px', marginBottom: '16px' }} />
			</Box>
			<Container maxWidth="lg" sx={{ mb: 10 }}>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						mb: 4,
					}}
				>
					<Tooltip title="View on CoinGecko" style={{ flexGrow: 1 }}>
						<a
							href={`https://www.coingecko.com/en/coins/ethereum/${currency}`}
							target="blank"
							rel="noreferrer"
							style={{ textDecoration: 'none', color: '#000000' }}
						>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									margin: 1,
									minWidth: '200px',
								}}
							>
								<img
									src={ethereumLogo}
									style={{ height: '20px', width: '20px', marginRight: '4px' }}
									alt="ethereum logo"
								/>
								<Typography sx={{ mr: 1, fontSize: 14, fontWeight: 'bold' }}>
									{addCommasToNumber(cryptoData.ethereum[currency])} {currency.toUpperCase()}
								</Typography>
								<Paper
									elevation="0"
									sx={{
										borderRadius: '100px',
										backgroundColor:
											cryptoData.ethereum[`${currency}_24h_change`] >= 0 ? '#8BC34A' : '#FF5252',
									}}
								>
									<Typography sx={{ color: '#FFFFFF', fontSize: 12, ml: 1, mr: 1 }}>
										{cryptoData.ethereum[`${currency}_24h_change`] > 0 ? '+' : null}
										{cryptoData.ethereum[`${currency}_24h_change`].toFixed(2)}%
									</Typography>
								</Paper>
							</Box>
						</a>
					</Tooltip>
					<Tooltip title="View on CoinGecko" style={{ flexGrow: 1 }}>
						<a
							href={`https://www.coingecko.com/en/coins/axie-infinity/${currency}`}
							target="blank"
							rel="noreferrer"
							style={{ textDecoration: 'none', color: '#000000' }}
						>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									margin: 1,
									minWidth: '200px',
								}}
							>
								<img
									src={axsLogo}
									style={{ height: '20px', width: '20px', marginRight: '4px' }}
									alt="axs logo"
								/>
								<Typography sx={{ mr: 1, fontSize: 14, fontWeight: 'bold' }}>
									{addCommasToNumber(cryptoData['axie-infinity'][currency])}{' '}
									{currency.toUpperCase()}
								</Typography>
								<Paper
									elevation="0"
									sx={{
										borderRadius: '100px',
										backgroundColor:
											cryptoData['axie-infinity'][`${currency}_24h_change`] >= 0
												? '#8BC34A'
												: '#FF5252',
									}}
								>
									<Typography sx={{ color: '#FFFFFF', fontSize: 12, ml: 1, mr: 1 }}>
										{cryptoData['axie-infinity'][`${currency}_24h_change`] > 0 ? '+' : null}
										{cryptoData['axie-infinity'][`${currency}_24h_change`].toFixed(2)}%
									</Typography>
								</Paper>
							</Box>
						</a>
					</Tooltip>
					<Tooltip title="View on CoinGecko" style={{ flexGrow: 1 }}>
						<a
							href={`https://www.coingecko.com/en/coins/smooth-love-potion/${currency}`}
							target="blank"
							rel="noreferrer"
							style={{ textDecoration: 'none', color: '#000000' }}
						>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									margin: 1,
									minWidth: '200px',
								}}
							>
								<img
									src={slpLogo}
									style={{ height: '20px', width: '20px', marginRight: '4px' }}
									alt="slp logo"
								/>
								<Typography sx={{ mr: 1, fontSize: 14, fontWeight: 'bold' }}>
									{cryptoData['smooth-love-potion'][currency]} {currency.toUpperCase()}
								</Typography>
								<Paper
									elevation="0"
									sx={{
										borderRadius: '100px',
										backgroundColor:
											cryptoData['smooth-love-potion'][`${currency}_24h_change`] >= 0
												? '#8BC34A'
												: '#FF5252',
									}}
								>
									<Typography sx={{ color: '#FFFFFF', fontSize: 12, ml: 1, mr: 1 }}>
										{cryptoData['smooth-love-potion'][`${currency}_24h_change`] > 0 ? '+' : null}
										{cryptoData['smooth-love-potion'][`${currency}_24h_change`].toFixed(2)}%
									</Typography>
								</Paper>
							</Box>
						</a>
					</Tooltip>
					{/* <SortSelect
						onUpdate={handleSortUpdate}
						localSettings={localSettings}
					/> */}
				</Box>

				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						mb: 4,
					}}
				>
					<BasicCard
						label="Total Average"
						slp={calculateTotal(data, 'average_slp')}
						slpPrice={cryptoData['smooth-love-potion'][currency]}
						currency={currency}
					/>

					<BasicCard
						label="Total Unclaimed"
						slp={calculateTotal(data, 'unclaimed_slp')}
						slpPrice={cryptoData['smooth-love-potion'][currency]}
						currency={currency}
					/>
					<BasicCard
						label="Total Claimed"
						slp={calculateTotal(data, 'claimed_slp')}
						slpPrice={cryptoData['smooth-love-potion'][currency]}
						currency={currency}
					/>
					<BasicCard
						label="Total Farmed"
						slp={calculateTotal(data, 'total_slp')}
						slpPrice={cryptoData['smooth-love-potion'][currency]}
						currency={currency}
					/>
					<BasicCard
						label="Manager Total"
						slp={calculateTotal(data, 'manager_share')}
						slpPrice={cryptoData['smooth-love-potion'][currency]}
						currency={currency}
					/>
					<BasicCard
						label="Scholar Total"
						slp={calculateTotal(data, 'scholar_share')}
						slpPrice={cryptoData['smooth-love-potion'][currency]}
						currency={currency}
					/>
				</Box>
				<Form localData={localData} onUpdate={handleUpdate} />
				{addresses.length !== 0 && (
					<>
						<Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
							<Typography>Sort by</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
								<SortSelect onUpdate={handleSortUpdate} localSettings={localSettings} />
								<SortTypeSelect onUpdate={handleSortUpdate} localSettings={localSettings} />
							</Box>
						</Box>
						<DataTable
							data={data}
							localData={localData}
							localSettings={localSettings}
							onDelete={handleUpdate}
							slpPrice={cryptoData['smooth-love-potion'][currency]}
						/>
						<Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
							<Button
								sx={{ margin: 1, minWidth: '200px' }}
								onClick={() => {
									handleJSONDownload(localData);
								}}
								startIcon={<DownloadIcon />}
								variant="outlined"
							>
								Export JSON
							</Button>
							<label htmlFor="contained-button-file">
								<Input
									onChange={handleJSONUpload}
									accept="application/JSON"
									id="contained-button-file"
									type="file"
								/>
								<Button
									component="span"
									startIcon={<UploadIcon />}
									variant="outlined"
									sx={{ margin: 1, minWidth: '200px' }}
								>
									Import JSON
								</Button>
							</label>
							<CSVLink
								filename={'scholars.csv'}
								data={cleanData(sortedData)}
								style={{ textDecoration: 'none' }}
							>
								<ExportButton />
							</CSVLink>
						</Box>
					</>
				)}
				{addresses.length === 0 && (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
						}}
					>
						<img src={axie} alt="axie" style={{ height: '150px', margin: '32px' }} />
						<Typography sx={{ mb: 10 }}>No scholars added</Typography>
						<label htmlFor="contained-button-file">
							<Input
								onChange={handleJSONUpload}
								accept="application/JSON"
								id="contained-button-file"
								type="file"
							/>
							<Button
								onClick={null}
								component="span"
								startIcon={<UploadIcon />}
								variant="contained"
								sx={{ margin: 1 }}
								size="large"
								disableElevation
							>
								Import JSON
							</Button>
						</label>
					</Box>
				)}
				{/* <Alert icon={false} severity="info" sx={{ margin: 1, mb: 4 }}>
					🚧 This site is under development.{' '}
					<a
						style={{ color: '#1976D2' }}
						href="mailto:610b145c-e385-48c8-bf7f-c4b9a2468b18@simplelogin.co?subject=Axie Scholar Tracker Bug"
					>
						Please click here to report bugs.
					</a>{' '}
					Thank you!
				</Alert> */}
			</Container>

			<Footer />
		</Box>
	);
}

export default App;
